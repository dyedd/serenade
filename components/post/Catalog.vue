<template>
    <ul>
        <template v-for="item in headings" :key="item.id">
            <li :class="{ active: item.id === activeId }">
                <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)">{{ item.id }}</a>
                <PostCatalog v-if="item.children.length > 0" :headings="item.children" :active-id="activeId"
                    @click="scrollToHeading($event)"></PostCatalog>
            </li>
        </template>
    </ul>
</template>

<script setup>
const props = defineProps({
    headings: {
        type: Array,
        required: true
    },
    activeId: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['click']);

const scrollToHeading = (id) => {
    emit('click', id);
};
</script>
<style lang="scss" scoped>
.toc {
  ul,
  li {
    list-style-type: none;
    padding-left: 0;
    padding-right: 0;
    line-height: 1.375;
  }

  li {
    &.active>a {
      color: rgba(var(--color-neutral), 1);
      text-decoration: none;
      background-color: rgba(var(--color-primary-600), 1);
      border-radius: 0.09rem;
    }
  }

  ul {
    ul {
      padding-inline-start: 1rem;
    }
  }

  a {
    font-weight: 400;
    --tw-text-opacity: 1;
    color: rgba(var(--color-neutral-700), var(--tw-text-opacity));

    &:hover {
      color: rgba(var(--color-neutral), 1);
    }
  }
}

</style>