<template>
    <main class="flex-grow bg-white p-8 overflow-y-auto">
        <ColumnsBreadcrumb />
        <div class="mb-8">
            <img src="https://placehold.co/1200x400" alt="Library Image" class="w-full h-auto rounded-lg">
        </div>
        <h1 class="text-2xl font-bold mb-6">程序性能优化理论</h1>
        <div class="prose">
            <h2 class="text-lg font-bold text-blue-600">1. 处理器发展</h2>
            <p class="mb-4">处理器的发展是一个逐渐演进的过程，涉及多个方面的技术进步。</p>
            <h2 class="text-lg font-bold text-blue-600">2. 性能优化指标 & 流程</h2>
            <p class="mb-4">在性能优化中，我们需要设立相关的指标并遵循优化流程。</p>
            <h3 class="font-semibold text-base">优化流程</h3>
            <ul class="list-disc list-inside mb-4">
                <li>设立性能指标</li>
                <li>查找性能瓶颈</li>
                <li>修改 & 验证有效性</li>
            </ul>
            <div class="bg-gray-100 p-4 rounded-lg">
                <pre><code>time ./a.out</code></pre>
            </div>
        </div>
    </main>
</template>

<script setup>

</script>