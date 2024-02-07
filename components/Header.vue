<template>
    <div>
        <!-- 博客头部 -->
        <header>
            <div>
                <img src="/logo.jpg">
                <span>染念's blog</span>
            </div>
            <div>
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
            </div>
        </header>
    </div>
</template>
  
<style lang="scss" scoped>
header {
    width: 1024px;
    margin: 0 auto;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    div {
        padding: 2rem;
        display: flex;
        align-items: center;
    }
    img {
        width: 4.8rem;
        height: 4.8rem;
        border-radius: .5rem;
    }
    span {
        font-size: 1.6rem;
        color: #666;
        margin-left: 2rem;
        font-weight: bold;
    }
}

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
}
</style>
  