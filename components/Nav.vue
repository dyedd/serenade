<template>
    <nav>
        <ul>
            <li>
                <NuxtLink to="/">🏠 Home</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/blogs">📂 Blogs</NuxtLink>
            </li>
        </ul>
    </nav>
</template>
  
<style lang="scss" scoped>
nav {
    font-size: 1.6rem;

    ul {
        list-style: none;
        padding: 0;
        display: flex;
        justify-content: center;
    }

    li {
        margin: 0 1rem;

        a {
            text-decoration: none;
            font-weight: bold;
        }
    }
}</style>
  