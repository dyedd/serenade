---
title: "Vue3 初探与实战"
date: 2022-01-01
---

# Vue3 初探与实战

Vue 3 引入了许多激动人心的新特性，其中最引人注目的莫过于组合式 API。这个新的 API 提供了一种更灵活的方式来组织组件逻辑，尤其是在处理复杂组件时。

## TodoList 示例

下面是一个使用 Vue 3 创建的 TodoList 应用的示例代码：

```javascript
import { ref } from 'vue';

export default {
  setup() {
    const todos = ref([]);
    const newTodo = ref('');

    function addTodo() {
      todos.value.push(newTodo.value);
      newTodo.value = '';
    }

    return {
      todos,
      newTodo,
      addTodo
    };
  }
}
