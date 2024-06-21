<template>
  <div class="left">
    <div class="logo">
      <img src="/logo.jpg" alt="logo">
      <div class="emoji">🚧</div>
    </div>
  </div>
  <div class="right">
    <h1>Hello, I'm <span class="text-gradient">染念</span>👋</h1>
    <p>A <span class="text">Full Stack</span> Developer ,also A <span class="text">Postgraduate</span> Student</p>
    <p> 🐲龙年大吉</p>
    <div class="icon-wrapper">
      <a href="https://github.com/dyedd" target="_blank">
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-github"></use>
        </svg>
        Github
      </a>
      <a href="mailto:1176996982@qq.com" target="_blank">
        <svg class="icon" aria-hidden="true" width="2.2rem" height="2.2rem">
          <use xlink:href="#icon-email"></use>
        </svg>
      </a>
    </div>
    <div class="hero-text">这个人的网站还在建设中...</div>
    <div class="box">

    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "home",
});
</script>
<style scoped>
.left {
  padding: 0 1.5rem;
}

.logo {
  position: relative;
}

.logo img {
  width: 10rem;
  border-radius: 50%;
}

.emoji {
  position: absolute;
  width: 4rem;
  height: 4rem;
  line-height: 4rem;
  border-radius: 50%;
  bottom: 0;
  right: 0;
  text-align: center;
  font-size: 2rem;
  background-color: #fff;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.04), 0 0.2rem 0.6rem rgba(0, 0, 0, 0.04), 0 0 0.1rem rgba(0, 0, 0, 0.04);
}


.right {
  padding: .5rem;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 1rem 0;
}

.text-gradient {
  background: linear-gradient(45deg, rgb(118 170 227), #826ac9 30%, white 60%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400%;
  background-position: 0%;
}

p {
  line-height: 1.6;
  margin: 1rem 0;
  font-size: 1.4rem;
}

.text {
  color: var(--color);
}

.icon-wrapper {
  color: #000;
}

.icon-wrapper a {
  padding: .5rem 1rem;
  text-decoration: none;
  border-radius: .6rem;
  display: inline-flex;
  font-size: 1.4rem;
  background: rgba(249, 250, 251, 0.6);
  color: #000;
  border-radius: .6rem;
  margin-right: 1rem;
}

.hero-text {
  margin-top: 2rem;
  padding: 15px 20px;
  background: #f9f0d4;
  border-radius: 6px;
  color: #644006;
  line-height: 1.5;
  position: relative;
}

.hero-text::before {
  content: "✍";
  font-size: 2.2rem;
  position: absolute;
  top: -32px;
}
</style>
