<script lang="ts" setup>
import HasPermission from "@/components/permission/HasPermission.vue";
import { usePermission } from "@/utils/permission";
import PostTag from "@console/modules/contents/posts/tags/components/PostTag.vue";
import { usePostTag } from "@console/modules/contents/posts/tags/composables/use-post-tag";
import type { FormKitFrameworkContext } from "@formkit/core";
import type { Tag } from "@halo-dev/api-client";
import { coreApiClient } from "@halo-dev/api-client";
import {
  IconArrowRight,
  IconCheckboxCircle,
  IconClose,
} from "@halo-dev/components";
import { onClickOutside } from "@vueuse/core";
import Fuse from "fuse.js";
import ShortUniqueId from "short-unique-id";
import { slugify } from "transliteration";
import { computed, ref, watch, type PropType } from "vue";

const { currentUserHasPermission } = usePermission();

const props = defineProps({
  context: {
    type: Object as PropType<FormKitFrameworkContext>,
    required: true,
  },
});

const multiple = computed(() => {
  const { multiple } = props.context;
  if (multiple === undefined) {
    return false;
  }

  if (typeof multiple === "boolean") {
    return multiple;
  }

  return multiple === "true";
});

const selectedTag = ref<Tag>();
const dropdownVisible = ref(false);
const text = ref("");
const wrapperRef = ref<HTMLElement>();

onClickOutside(wrapperRef, () => {
  dropdownVisible.value = false;
});

const { tags: postTags, handleFetchTags } = usePostTag();

// search
let fuse: Fuse<Tag> | undefined = undefined;

const searchResults = computed(() => {
  if (!text.value) {
    return postTags.value;
  }

  return fuse?.search(text.value).map((item) => item.item) || [];
});

watch(
  () => searchResults.value,
  (value) => {
    if (value?.length && text.value) {
      selectedTag.value = value[0];
      scrollToSelected();
    } else {
      selectedTag.value = undefined;
    }
  }
);

watch(
  () => postTags.value,
  () => {
    fuse = new Fuse(postTags.value || [], {
      keys: ["spec.displayName", "metadata.name", "spec.email"],
      useExtendedSearch: true,
      threshold: 0.2,
    });
  },
  {
    immediate: true,
  }
);

const selectedTags = computed(() => {
  if (multiple.value) {
    const selectedTagNames = (props.context._value as string[]) || [];
    return selectedTagNames
      .map((tagName): Tag | undefined => {
        return postTags.value?.find((tag) => tag.metadata.name === tagName);
      })
      .filter(Boolean) as Tag[];
  }

  const tag = postTags.value?.find(
    (tag) => tag.metadata.name === props.context._value
  );

  return [tag].filter(Boolean) as Tag[];
});

const isSelected = (tag: Tag) => {
  if (multiple.value) {
    return (props.context._value || []).includes(tag.metadata.name);
  }

  return props.context._value === tag.metadata.name;
};

const handleSelect = (tag: Tag) => {
  if (multiple.value) {
    const currentValue = props.context._value || [];
    if (currentValue.includes(tag.metadata.name)) {
      props.context.node.input(
        currentValue.filter((t) => t !== tag.metadata.name)
      );
    } else {
      props.context.node.input([...currentValue, tag.metadata.name]);
      text.value = "";
    }
    return;
  }

  props.context.node.input(
    tag.metadata.name === props.context._value ? "" : tag.metadata.name
  );
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!searchResults.value) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();

    const index = searchResults.value.findIndex(
      (tag) => tag.metadata.name === selectedTag.value?.metadata.name
    );
    if (index < searchResults.value.length - 1) {
      selectedTag.value = searchResults.value[index + 1];
    }

    scrollToSelected();
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();

    const index = searchResults.value.findIndex(
      (tag) => tag.metadata.name === selectedTag.value?.metadata.name
    );
    if (index > 0) {
      selectedTag.value = searchResults.value[index - 1];
    } else {
      selectedTag.value = undefined;
    }

    scrollToSelected();
  }

  if (e.key === "Enter") {
    if (!selectedTag.value && text.value) {
      handleCreateTag();
      return;
    }

    if (selectedTag.value) {
      handleSelect(selectedTag.value);
      text.value = "";

      e.preventDefault();
    }
  }
};

const scrollToSelected = () => {
  const selectedNodeName = selectedTag.value
    ? selectedTag.value?.metadata.name
    : "tag-create";

  const selectedNode = document.getElementById(selectedNodeName);

  if (selectedNode) {
    selectedNode.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
};

const uid = new ShortUniqueId();

const handleCreateTag = async () => {
  if (!currentUserHasPermission(["system:posts:manage"])) {
    return;
  }

  let slug = slugify(text.value, { trim: true });

  // Check if slug is unique, if not, add -1 to the slug
  const { data: tagsWithSameSlug } = await coreApiClient.content.tag.listTag({
    fieldSelector: [`spec.slug=${slug}`],
  });

  if (tagsWithSameSlug.total) {
    slug = `${slug}-${uid.randomUUID(8)}`;
  }

  const { data } = await coreApiClient.content.tag.createTag({
    tag: {
      spec: {
        displayName: text.value,
        slug,
        color: "#ffffff",
        cover: "",
      },
      apiVersion: "content.halo.run/v1alpha1",
      kind: "Tag",
      metadata: {
        name: "",
        generateName: "tag-",
      },
    },
  });

  handleFetchTags();

  handleSelect(data);

  text.value = "";
};

// update value immediately during IME composition
// please see https://vuejs.org//guide/essentials/forms.html#text
const onTextInput = (e: Event) => {
  text.value = (e.target as HTMLInputElement).value;
};

// delete last tag when text input is empty
const handleDelete = () => {
  if (!text.value) {
    if (multiple.value) {
      const selectedTagNames = (props.context._value as string[]) || [];
      props.context.node.input(selectedTagNames.slice(0, -1));
      return;
    }
    props.context.node.input("");
  }
};
</script>

<template>
  <div
    ref="wrapperRef"
    :class="context.classes['post-tags-wrapper']"
    @keydown="handleKeydown"
  >
    <div :class="context.classes['post-tags']">
      <div
        v-for="(tag, index) in selectedTags"
        :key="index"
        :class="context.classes['post-tag-wrapper']"
      >
        <PostTag :tag="tag" rounded>
          <template #rightIcon>
            <IconClose
              :class="context.classes['post-tag-close']"
              @click="handleSelect(tag)"
            />
          </template>
        </PostTag>
      </div>
      <input
        :value="text"
        :class="context.classes.input"
        type="text"
        @input="onTextInput"
        @focus="dropdownVisible = true"
        @keydown.delete="handleDelete"
      />
    </div>

    <div
      :class="context.classes['post-tags-button']"
      @click="dropdownVisible = !dropdownVisible"
    >
      <IconArrowRight class="rotate-90 text-gray-500 hover:text-gray-700" />
    </div>

    <div v-if="dropdownVisible" :class="context.classes['dropdown-wrapper']">
      <ul class="p-1">
        <HasPermission
          v-if="text.trim()"
          :permissions="['system:posts:manage']"
        >
          <li
            id="tag-create"
            class="group flex cursor-pointer items-center justify-between rounded p-2"
            :class="{
              'bg-gray-100': selectedTag === undefined,
            }"
            @click="handleCreateTag"
          >
            <span class="text-xs text-gray-700 group-hover:text-gray-900">
              {{ $t("core.formkit.tag_select.creation_label", { text: text }) }}
            </span>
          </li>
        </HasPermission>
        <li
          v-for="tag in searchResults"
          :id="tag.metadata.name"
          :key="tag.metadata.name"
          class="group flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-100"
          :class="{
            'bg-gray-100': selectedTag?.metadata.name === tag.metadata.name,
          }"
          @click="handleSelect(tag)"
        >
          <div class="inline-flex items-center overflow-hidden">
            <PostTag :tag="tag" />
          </div>
          <IconCheckboxCircle v-if="isSelected(tag)" class="text-primary" />
        </li>
      </ul>
    </div>
  </div>
</template>
