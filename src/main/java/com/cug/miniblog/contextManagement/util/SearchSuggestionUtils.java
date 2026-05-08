package com.cug.miniblog.contextManagement.util;

import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.HanyuPinyinToneType;
import net.sourceforge.pinyin4j.format.HanyuPinyinVCharType;
import net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

public final class SearchSuggestionUtils {

    private static final Pattern SPLIT_PATTERN = Pattern.compile("[\\s,，。.!！？?；;：:、()（）\\[\\]【】{}<>《》/\\\\+\\-_]+");
    private static final HanyuPinyinOutputFormat PINYIN_FORMAT = buildPinyinFormat();

    private SearchSuggestionUtils() {
    }

    public static String suggest(String keyword, Collection<String> sources) {
        String normalizedKeyword = normalize(keyword);
        String keywordPinyin = toPinyin(keyword);
        String keywordFuzzyPinyin = normalizeFuzzyPinyin(keywordPinyin);
        if (!StringUtils.hasText(normalizedKeyword) || normalizedKeyword.length() < 2 || sources == null || sources.isEmpty()) {
            return null;
        }

        Map<String, CandidateInfo> candidates = collectCandidates(sources, normalizedKeyword.length());
        String bestSuggestion = null;
        int bestScore = Integer.MAX_VALUE;
        String fallbackSuggestion = null;
        int fallbackScore = Integer.MAX_VALUE;

        for (CandidateInfo candidateInfo : candidates.values()) {
            String candidate = candidateInfo.normalized;
            if (!StringUtils.hasText(candidate) || candidate.equals(normalizedKeyword)) {
                continue;
            }

            int distance = levenshteinDistance(normalizedKeyword, candidate);
            int maxDistance = maxDistance(normalizedKeyword.length(), candidate.length());
            double ratio = (double) distance / Math.max(normalizedKeyword.length(), candidate.length());
            int lengthGap = Math.abs(normalizedKeyword.length() - candidate.length());
            int overlap = longestCommonSubstringLength(normalizedKeyword, candidate);
            SimilarityMetrics pinyinMetrics = SimilarityMetrics.of(keywordPinyin, keywordFuzzyPinyin, candidateInfo.pinyin, candidateInfo.fuzzyPinyin);

            int score = scoreCandidate(distance, lengthGap, overlap, pinyinMetrics, candidateInfo.displayValue);
            if (isStrongTextMatch(distance, maxDistance, ratio, lengthGap)
                    || isStrongPinyinMatch(pinyinMetrics)) {
                if (score < bestScore
                        || (score == bestScore
                        && (bestSuggestion == null || candidateInfo.displayValue.length() < bestSuggestion.length()))) {
                    bestScore = score;
                    bestSuggestion = candidateInfo.displayValue;
                }
                continue;
            }

            if (isFallbackTextMatch(distance, maxDistance, ratio, lengthGap, overlap, normalizedKeyword, candidate)
                    || isFallbackPinyinMatch(pinyinMetrics)) {
                if (score < fallbackScore
                        || (score == fallbackScore
                        && (fallbackSuggestion == null || candidateInfo.displayValue.length() < fallbackSuggestion.length()))) {
                    fallbackScore = score;
                    fallbackSuggestion = candidateInfo.displayValue;
                }
            }
        }

        return bestSuggestion != null ? bestSuggestion : fallbackSuggestion;
    }

    private static HanyuPinyinOutputFormat buildPinyinFormat() {
        HanyuPinyinOutputFormat format = new HanyuPinyinOutputFormat();
        format.setCaseType(HanyuPinyinCaseType.LOWERCASE);
        format.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
        format.setVCharType(HanyuPinyinVCharType.WITH_V);
        return format;
    }

    private static Map<String, CandidateInfo> collectCandidates(Collection<String> sources, int keywordLength) {
        Map<String, CandidateInfo> candidates = new LinkedHashMap<>();
        for (String source : sources) {
            if (!StringUtils.hasText(source)) {
                continue;
            }
            String trimmed = source.trim();
            addCandidate(candidates, trimmed, trimmed);

            for (String segment : SPLIT_PATTERN.split(trimmed)) {
                if (StringUtils.hasText(segment)) {
                    addCandidate(candidates, segment.trim(), segment.trim());
                }
            }

            for (String window : extractWindows(trimmed, keywordLength)) {
                addCandidate(candidates, window, window);
            }
        }
        return candidates;
    }

    private static void addCandidate(Map<String, CandidateInfo> candidates, String rawValue, String displayValue) {
        String normalized = normalize(rawValue);
        if (!StringUtils.hasText(normalized)) {
            return;
        }

        CandidateInfo candidateInfo = new CandidateInfo(normalized, displayValue);
        CandidateInfo existing = candidates.get(normalized);
        if (existing == null || candidateInfo.displayValue.length() < existing.displayValue.length()) {
            candidates.put(normalized, candidateInfo);
        }
    }

    private static Set<String> extractWindows(String source, int keywordLength) {
        String normalized = normalize(source);
        Set<String> windows = new LinkedHashSet<>();
        if (!StringUtils.hasText(normalized) || normalized.length() <= keywordLength + 2) {
            return windows;
        }

        int minLength = Math.max(2, keywordLength - 1);
        int maxLength = Math.min(normalized.length(), keywordLength + 2);
        for (int length = minLength; length <= maxLength; length++) {
            for (int start = 0; start + length <= normalized.length(); start++) {
                windows.add(normalized.substring(start, start + length));
            }
        }
        return windows;
    }

    private static boolean isStrongTextMatch(int distance, int maxDistance, double ratio, int lengthGap) {
        return distance <= maxDistance && ratio <= 0.4D && lengthGap <= 2;
    }

    private static boolean isFallbackTextMatch(
            int distance,
            int maxDistance,
            double ratio,
            int lengthGap,
            int overlap,
            String keyword,
            String candidate
    ) {
        return distance <= maxDistance + 1
                && ratio <= 0.55D
                && lengthGap <= 2
                && overlap >= Math.max(2, Math.min(keyword.length(), candidate.length()) / 2);
    }

    private static boolean isStrongPinyinMatch(SimilarityMetrics metrics) {
        if (!metrics.available()) {
            return false;
        }
        return (metrics.distance <= metrics.maxDistance && metrics.ratio <= 0.18D)
                || (metrics.fuzzyDistance <= metrics.maxDistance && metrics.fuzzyRatio <= 0.12D);
    }

    private static boolean isFallbackPinyinMatch(SimilarityMetrics metrics) {
        if (!metrics.available()) {
            return false;
        }
        int fallbackMaxDistance = metrics.maxDistance + 1;
        return ((metrics.distance <= fallbackMaxDistance && metrics.ratio <= 0.28D)
                || (metrics.fuzzyDistance <= fallbackMaxDistance && metrics.fuzzyRatio <= 0.22D))
                && metrics.overlap >= Math.max(3, Math.min(metrics.leftLength, metrics.rightLength) / 2);
    }

    private static int scoreCandidate(
            int distance,
            int lengthGap,
            int overlap,
            SimilarityMetrics metrics,
            String displayValue
    ) {
        int score = distance * 120 + lengthGap * 15 + displayValue.length() * 2;
        score -= overlap * 6;
        if (metrics.available()) {
            score += metrics.distance * 18;
            score += metrics.fuzzyDistance * 10;
            score -= Math.min(60, metrics.overlap * 4);
        }
        return score;
    }

    private static int maxDistance(int leftLength, int rightLength) {
        int maxLength = Math.max(leftLength, rightLength);
        if (maxLength <= 4) {
            return 1;
        }
        if (maxLength <= 8) {
            return 2;
        }
        return 3;
    }

    private static int maxPinyinDistance(int leftLength, int rightLength) {
        int maxLength = Math.max(leftLength, rightLength);
        if (maxLength <= 6) {
            return 1;
        }
        if (maxLength <= 12) {
            return 2;
        }
        return 3;
    }

    static String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }

        StringBuilder builder = new StringBuilder(value.length());
        for (char current : value.trim().toCharArray()) {
            if (Character.isLetterOrDigit(current) || isCjk(current)) {
                builder.append(Character.toLowerCase(current));
            }
        }
        return builder.toString();
    }

    static String toPinyin(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }

        StringBuilder builder = new StringBuilder(value.length() * 2);
        for (char current : value.trim().toCharArray()) {
            if (isCjk(current)) {
                try {
                    String[] pinyinArray = PinyinHelper.toHanyuPinyinStringArray(current, PINYIN_FORMAT);
                    if (pinyinArray != null && pinyinArray.length > 0) {
                        builder.append(pinyinArray[0]);
                    }
                } catch (BadHanyuPinyinOutputFormatCombination exception) {
                    throw new IllegalStateException("生成拼音失败", exception);
                }
                continue;
            }
            if (Character.isLetterOrDigit(current)) {
                builder.append(Character.toLowerCase(current));
            }
        }
        return builder.toString();
    }

    static String normalizeFuzzyPinyin(String pinyin) {
        if (!StringUtils.hasText(pinyin)) {
            return "";
        }

        String normalized = pinyin.toLowerCase();
        normalized = normalized.replace("zh", "z");
        normalized = normalized.replace("ch", "c");
        normalized = normalized.replace("sh", "s");
        normalized = normalized.replace("ang", "an");
        normalized = normalized.replace("eng", "en");
        normalized = normalized.replace("ing", "in");
        return normalized;
    }

    private static boolean isCjk(char value) {
        Character.UnicodeBlock block = Character.UnicodeBlock.of(value);
        return block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS
                || block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A
                || block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B
                || block == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS;
    }

    static int levenshteinDistance(String left, String right) {
        int[][] distances = new int[left.length() + 1][right.length() + 1];
        for (int index = 0; index <= left.length(); index++) {
            distances[index][0] = index;
        }
        for (int index = 0; index <= right.length(); index++) {
            distances[0][index] = index;
        }

        for (int leftIndex = 1; leftIndex <= left.length(); leftIndex++) {
            for (int rightIndex = 1; rightIndex <= right.length(); rightIndex++) {
                int substitutionCost = left.charAt(leftIndex - 1) == right.charAt(rightIndex - 1) ? 0 : 1;
                distances[leftIndex][rightIndex] = Math.min(
                        Math.min(
                                distances[leftIndex - 1][rightIndex] + 1,
                                distances[leftIndex][rightIndex - 1] + 1
                        ),
                        distances[leftIndex - 1][rightIndex - 1] + substitutionCost
                );
            }
        }

        return distances[left.length()][right.length()];
    }

    static int longestCommonSubstringLength(String left, String right) {
        if (!StringUtils.hasText(left) || !StringUtils.hasText(right)) {
            return 0;
        }

        int[][] lengths = new int[left.length() + 1][right.length() + 1];
        int maxLength = 0;
        for (int leftIndex = 1; leftIndex <= left.length(); leftIndex++) {
            for (int rightIndex = 1; rightIndex <= right.length(); rightIndex++) {
                if (left.charAt(leftIndex - 1) == right.charAt(rightIndex - 1)) {
                    lengths[leftIndex][rightIndex] = lengths[leftIndex - 1][rightIndex - 1] + 1;
                    maxLength = Math.max(maxLength, lengths[leftIndex][rightIndex]);
                }
            }
        }
        return maxLength;
    }

    private static final class CandidateInfo {
        private final String normalized;
        private final String displayValue;
        private final String pinyin;
        private final String fuzzyPinyin;

        private CandidateInfo(String normalized, String displayValue) {
            this.normalized = normalized;
            this.displayValue = displayValue;
            this.pinyin = toPinyin(displayValue);
            this.fuzzyPinyin = normalizeFuzzyPinyin(this.pinyin);
        }
    }

    private static final class SimilarityMetrics {
        private final int distance;
        private final double ratio;
        private final int fuzzyDistance;
        private final double fuzzyRatio;
        private final int overlap;
        private final int maxDistance;
        private final int leftLength;
        private final int rightLength;

        private SimilarityMetrics(
                int distance,
                double ratio,
                int fuzzyDistance,
                double fuzzyRatio,
                int overlap,
                int maxDistance,
                int leftLength,
                int rightLength
        ) {
            this.distance = distance;
            this.ratio = ratio;
            this.fuzzyDistance = fuzzyDistance;
            this.fuzzyRatio = fuzzyRatio;
            this.overlap = overlap;
            this.maxDistance = maxDistance;
            this.leftLength = leftLength;
            this.rightLength = rightLength;
        }

        private static SimilarityMetrics of(String left, String fuzzyLeft, String right, String fuzzyRight) {
            if (!StringUtils.hasText(left) || !StringUtils.hasText(right)) {
                return new SimilarityMetrics(Integer.MAX_VALUE, 1D, Integer.MAX_VALUE, 1D, 0, 0, 0, 0);
            }

            int distance = levenshteinDistance(left, right);
            int fuzzyDistance = levenshteinDistance(fuzzyLeft, fuzzyRight);
            int maxLength = Math.max(left.length(), right.length());
            int fuzzyMaxLength = Math.max(fuzzyLeft.length(), fuzzyRight.length());
            return new SimilarityMetrics(
                    distance,
                    (double) distance / maxLength,
                    fuzzyDistance,
                    (double) fuzzyDistance / fuzzyMaxLength,
                    longestCommonSubstringLength(fuzzyLeft, fuzzyRight),
                    maxPinyinDistance(left.length(), right.length()),
                    left.length(),
                    right.length()
            );
        }

        private boolean available() {
            return this.maxDistance > 0;
        }
    }
}
