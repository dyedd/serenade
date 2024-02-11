<template>
    <div>
        <!-- 博客头部 -->
        <header>
            <div>
                <img src="/logo.jpg">
            </div>
            <div>
                <Nav></Nav>
            </div>
        </header>
    </div>
</template>
  
<style lang="scss" scoped>
header {
    width: 102.4rem;
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
        width: 4rem;
        height: 4rem;
        border-radius: 1.5rem;
    }
}
</style>
  