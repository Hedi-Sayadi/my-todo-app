package com.hedi.todo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

public class CategoryControllerTest {

    private final CategoryService categoryService = mock(CategoryService.class);
    private final CategoryController controller = new CategoryController(categoryService);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void createCategory_returnsCreated() throws Exception {
        CategoryRequestDTO req = CategoryRequestDTO.builder().name("N").description("d").build();
        CategoryResponseDTO resp = CategoryResponseDTO.builder().id(8L).name("N").build();
        given(categoryService.createCategory(any(CategoryRequestDTO.class))).willReturn(resp);

        mvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(8));
    }

    @Test
    void getAllCategories_returnsOk() throws Exception {
        CategoryResponseDTO a = CategoryResponseDTO.builder().id(1L).name("A").build();
        given(categoryService.getAllCategories()).willReturn(List.of(a));

        mvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getCategoryById_returnsOk() throws Exception {
        CategoryResponseDTO resp = CategoryResponseDTO.builder().id(2L).name("B").build();
        given(categoryService.getCategoryById(2L)).willReturn(resp);

        mvc.perform(get("/api/categories/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2));
    }

    @Test
    void getCategoryByName_returnsOk() throws Exception {
        CategoryResponseDTO resp = CategoryResponseDTO.builder().id(3L).name("Work").build();
        given(categoryService.getCategoryByName("Work")).willReturn(resp);

        mvc.perform(get("/api/categories/name/Work"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3));
    }

    @Test
    void updateCategory_returnsOk() throws Exception {
        CategoryRequestDTO req = CategoryRequestDTO.builder().name("Updated").description("desc").build();
        CategoryResponseDTO resp = CategoryResponseDTO.builder().id(4L).name("Updated").build();
        given(categoryService.updateCategory(eq(4L), any(CategoryRequestDTO.class))).willReturn(resp);

        mvc.perform(put("/api/categories/4")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(4));
    }

    @Test
    void deleteCategory_returnsNoContent() throws Exception {
        mvc.perform(delete("/api/categories/5"))
                .andExpect(status().isNoContent());
    }
}
