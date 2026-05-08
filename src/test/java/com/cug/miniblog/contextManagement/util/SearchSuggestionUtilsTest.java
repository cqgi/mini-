package com.cug.miniblog.contextManagement.util;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SearchSuggestionUtilsTest {

    @Test
    void shouldSuggestClosestTagName() {
        String suggestion = SearchSuggestionUtils.suggest(
                "厕试方法",
                List.of("学习方法", "测试方法", "项目实战")
        );

        assertEquals("测试方法", suggestion);
    }

    @Test
    void shouldSuggestTitleFragmentInsteadOfWholeTitle() {
        String suggestion = SearchSuggestionUtils.suggest(
                "联调厕试",
                List.of("接口联调测试复盘", "Java开发")
        );

        assertEquals("联调测试", suggestion);
    }

    @Test
    void shouldSuggestByFullPinyinInput() {
        String suggestion = SearchSuggestionUtils.suggest(
                "ceshifangfa",
                List.of("测试方法", "项目实战")
        );

        assertEquals("测试方法", suggestion);
    }

    @Test
    void shouldSuggestByFuzzyPinyinInput() {
        String suggestion = SearchSuggestionUtils.suggest(
                "cesifangfa",
                List.of("测试方法", "项目实战")
        );

        assertEquals("测试方法", suggestion);
    }

    @Test
    void shouldReturnNullForUnrelatedKeyword() {
        String suggestion = SearchSuggestionUtils.suggest(
                "天气很好",
                List.of("项目实战", "Java开发", "Markdown")
        );

        assertNull(suggestion);
    }
}
