<template>
    <aside class="sidebar bg-white p-4 flex flex-col border-r border-gray-200">
      <div class="flex items-center mb-6">
        <div class="bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
          P
        </div>
        <div class="ml-3">
          <h2 class="text-lg font-semibold">PAC 2024</h2>
          <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">企业公开</span>
        </div>
      </div>
      <div class="relative mb-4">
        <input type="text" placeholder="搜索" class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
      </div>
      <nav class="flex-grow">
        <ul class="space-y-2 text-sm">
          <li>
            <a href="#" class="flex items-center text-gray-900 font-semibold bg-gray-200 px-3 py-2 rounded">
              程序性能优化理论
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center text-gray-600 px-3 py-2 rounded hover:bg-gray-100">
              Winograd
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center text-gray-600 px-3 py-2 rounded hover:bg-gray-100">
              优化过程
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <style scoped>
  .sidebar {
    width: 280px;
  }
  </style>
  