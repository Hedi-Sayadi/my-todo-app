package com.hedi.todo.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.exception.CategoryNotFoundException;
import com.hedi.todo.backend.repository.CategoryRepository;
import com.hedi.todo.backend.util.CategoryMapper;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

	@Mock
	private CategoryRepository categoryRepository;

	@Mock
	private CategoryMapper categoryMapper;

	@InjectMocks
	private CategoryService categoryService;

	@Captor
	private ArgumentCaptor<Category> categoryCaptor;

	private CategoryRequestDTO request;
	private Category category;
	private CategoryResponseDTO response;

	@BeforeEach
	void setUp() {
		request = CategoryRequestDTO.builder()
			.name("Work")
			.description("Work related tasks")
			.build();

		category = Category.builder()
			.id(4L)
			.name("Work")
			.description("Work related tasks")
			.tasks(new HashSet<>())
			.createdAt(LocalDateTime.of(2026, 5, 17, 10, 0))
			.updatedAt(LocalDateTime.of(2026, 5, 17, 10, 0))
			.build();

		response = CategoryResponseDTO.builder()
			.id(4L)
			.name("Work")
			.description("Work related tasks")
			.createdAt(LocalDateTime.of(2026, 5, 17, 10, 0))
			.updatedAt(LocalDateTime.of(2026, 5, 17, 10, 0))
			.build();
	}

	@Test
	void createCategoryShouldSaveAndReturnMappedResponse() {
		when(categoryRepository.existsByName("Work")).thenReturn(false);
		when(categoryMapper.toEntity(request)).thenReturn(category);
		when(categoryRepository.save(categoryCaptor.capture())).thenReturn(category);
		when(categoryMapper.toResponseDTO(category)).thenReturn(response);

		CategoryResponseDTO result = categoryService.createCategory(request);

		assertThat(categoryCaptor.getValue()).isEqualTo(category);
		assertThat(result).isEqualTo(response);
	}

	@Test
	void createCategoryShouldRejectDuplicateName() {
		when(categoryRepository.existsByName("Work")).thenReturn(true);

		assertThatThrownBy(() -> categoryService.createCategory(request))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("Category with name 'Work' already exists");

		verify(categoryRepository, never()).save(any());
		verify(categoryMapper, never()).toEntity(any());
	}

	@Test
	void getCategoryByIdShouldReturnMappedCategory() {
		when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));
		when(categoryMapper.toResponseDTO(category)).thenReturn(response);

		CategoryResponseDTO result = categoryService.getCategoryById(4L);

		assertThat(result).isEqualTo(response);
	}

	@Test
	void getCategoryByIdShouldThrowWhenMissing() {
		when(categoryRepository.findById(4L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> categoryService.getCategoryById(4L))
			.isInstanceOf(CategoryNotFoundException.class)
			.hasMessage("Category not found with id: 4");

		verify(categoryMapper, never()).toResponseDTO(any());
	}

	@Test
	void getAllCategoriesShouldMapAllResults() {
		when(categoryRepository.findAll()).thenReturn(List.of(category));
		when(categoryMapper.toResponseDTO(category)).thenReturn(response);

		List<CategoryResponseDTO> results = categoryService.getAllCategories();

		assertThat(results).containsExactly(response);
	}

	@Test
	void updateCategoryShouldUpdateAndReturnMappedResponse() {
		CategoryRequestDTO updateRequest = CategoryRequestDTO.builder()
			.name("Personal")
			.description("Personal tasks")
			.build();

		Category updatedCategory = Category.builder()
			.id(4L)
			.name("Personal")
			.description("Personal tasks")
			.tasks(new HashSet<>())
			.build();

		CategoryResponseDTO updatedResponse = CategoryResponseDTO.builder()
			.id(4L)
			.name("Personal")
			.description("Personal tasks")
			.build();

		when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));
		when(categoryRepository.existsByName("Personal")).thenReturn(false);
		when(categoryRepository.save(category)).thenReturn(updatedCategory);
		when(categoryMapper.toResponseDTO(updatedCategory)).thenReturn(updatedResponse);
		doAnswer(invocation -> {
			category.setName(updateRequest.getName());
			category.setDescription(updateRequest.getDescription());
			return null;
		}).when(categoryMapper).updateEntity(updateRequest, category);

		CategoryResponseDTO result = categoryService.updateCategory(4L, updateRequest);

		assertThat(result).isEqualTo(updatedResponse);
		assertThat(category.getName()).isEqualTo("Personal");
		assertThat(category.getDescription()).isEqualTo("Personal tasks");
	}

	@Test
	void updateCategoryShouldRejectDuplicateName() {
		CategoryRequestDTO updateRequest = CategoryRequestDTO.builder()
			.name("Other")
			.description("Updated")
			.build();

		when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));
		when(categoryRepository.existsByName("Other")).thenReturn(true);

		assertThatThrownBy(() -> categoryService.updateCategory(4L, updateRequest))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("Category with name 'Other' already exists");

		verify(categoryRepository, never()).save(any());
	}

	@Test
	void updateCategoryShouldThrowWhenMissing() {
		when(categoryRepository.findById(4L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> categoryService.updateCategory(4L, request))
			.isInstanceOf(CategoryNotFoundException.class)
			.hasMessage("Category not found with id: 4");

		verify(categoryRepository, never()).save(any());
	}

	@Test
	void deleteCategoryShouldDeleteWhenNoTasksExist() {
		when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));

		categoryService.deleteCategory(4L);

		verify(categoryRepository).delete(category);
	}

	@Test
	void deleteCategoryShouldRejectWhenTasksExist() {
		category.getTasks().add(Task.builder()
			.id(99L)
			.title("Stub")
			.priority(TaskPriority.LOW)
			.status(TaskStatus.TODO)
			.build());
		when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));

		assertThatThrownBy(() -> categoryService.deleteCategory(4L))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("Cannot delete category with existing tasks. Please reassign or delete tasks first.");

		verify(categoryRepository, never()).delete(any());
	}

	@Test
	void deleteCategoryShouldThrowWhenMissing() {
		when(categoryRepository.findById(4L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> categoryService.deleteCategory(4L))
			.isInstanceOf(CategoryNotFoundException.class)
			.hasMessage("Category not found with id: 4");

		verify(categoryRepository, never()).delete(any());
	}

	@Test
	void getCategoryByNameShouldReturnMappedCategory() {
		when(categoryRepository.findByName("Work")).thenReturn(Optional.of(category));
		when(categoryMapper.toResponseDTO(category)).thenReturn(response);

		CategoryResponseDTO result = categoryService.getCategoryByName("Work");

		assertThat(result).isEqualTo(response);
	}

	@Test
	void getCategoryByNameShouldThrowWhenMissing() {
		when(categoryRepository.findByName("Missing")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> categoryService.getCategoryByName("Missing"))
			.isInstanceOf(CategoryNotFoundException.class)
			.hasMessage("Category not found with name: Missing");
	}
}