package com.hedi.todo.backend.util;

import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.entity.Category;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class CategoryMapperTest {

    private final CategoryMapper mapper = new CategoryMapper();

    @Test
    void toResponseDTO_null_returnsNull() {
        CategoryResponseDTO dto = mapper.toResponseDTO(null);
        assertThat(dto).isNull();
    }

    @Test
    void toResponseDTO_mapsFields() {
        Category c = Category.builder()
                .id(7L)
                .name("Work")
                .description("Work related tasks")
                .build();

        CategoryResponseDTO dto = mapper.toResponseDTO(c);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(7L);
        assertThat(dto.getName()).isEqualTo("Work");
        assertThat(dto.getDescription()).isEqualTo("Work related tasks");
    }

    @Test
    void toEntity_null_returnsNull() {
        Category entity = mapper.toEntity(null);
        assertThat(entity).isNull();
    }

    @Test
    void toEntity_mapsFields() {
        CategoryRequestDTO req = CategoryRequestDTO.builder()
                .name("Home")
                .description("Home tasks")
                .build();

        Category entity = mapper.toEntity(req);

        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Home");
        assertThat(entity.getDescription()).isEqualTo("Home tasks");
    }

    @Test
    void updateEntity_null_requestDoesNothing() {
        Category c = Category.builder().name("Old").description("old").build();
        mapper.updateEntity(null, c);
        assertThat(c.getName()).isEqualTo("Old");
    }

    @Test
    void updateEntity_updatesFields() {
        Category c = Category.builder().name("Old").description("old").build();
        CategoryRequestDTO req = CategoryRequestDTO.builder().name("New").description("new").build();
        mapper.updateEntity(req, c);
        assertThat(c.getName()).isEqualTo("New");
        assertThat(c.getDescription()).isEqualTo("new");
    }

}
