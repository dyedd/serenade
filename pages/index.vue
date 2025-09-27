<template>
  <div class="container">
    <div class="left">
      <div class="logo">
        <img src="/logo.jpg" alt="logo" />
        <div class="emoji">🚧</div>
      </div>
      <div class="location-info">
        <div class="location">
          <svg class="icon" aria-hidden="true" width="1.6rem" height="1.6rem">
            <use xlink:href="#icon-location"></use>
          </svg>
          西安, 中国
        </div>
      </div>
    </div>
    <div class="right">
      <h1>Hello, I'm <span class="text-gradient">染念</span>👋</h1>
      <p>
        <span class="text">AI infra</span>研究生，目前研究<span
          style="text-decoration: wavy underline"
          >分布式训练与推理</span
        >以及<span class="text">扩散模型在短临降水领域</span>的应用
      </p>
      <p>🐍巳巳如意,生生不息</p>
      <p>🌈🌈🌈</p>
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
      <div class="hero-text">
        我将在这里分享我的<span class="text">编程</span>和<span class="text"
          >人工智能</span
        >知识。如果你对这些主题感兴趣，那么恭喜你找到宝藏了。接下来你可以查看内容或订阅
        <a class="text" href="/feed">RSS</a>。
      </div>
      <div class="my_status">
        <div class="status-item">
          <img
            src="https://github-readme-stats.vercel.app/api?username=dyedd&show_icons=true&hide=contribs,prs&count_private=true&bg_color=30,77FFD2,6297DB,1EECFF&title_color=fff&text_color=fff&icon_color=fff"
          />
        </div>
        <div class="status-item">
          <img
            src="https://github-readme-stats.vercel.app/api/wakatime?username=@dyedd&custom_title=编程时间&langs_count=10"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "home",
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  max-width: 75rem;
  margin: 0 auto;
  padding: 2rem;
}

.left {
  position: sticky;
  top: 2rem;
  height: fit-content;
  padding: 0 1.5rem;

  .logo {
    position: relative;
    width: 10rem;

    img {
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
      box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.04),
        0 0.2rem 0.6rem rgba(0, 0, 0, 0.04), 0 0 0.1rem rgba(0, 0, 0, 0.04);
    }
  }
}

.location-info {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  color: var(--text-color-2);

  .location {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      flex-shrink: 0;
      margin-top: 1px;
    }
  }
}

.right {
  padding: 0.5rem;
  width: 58rem;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 1rem 0;
  }

  p {
    line-height: 1.6;
    margin: 1rem 0;
    font-size: 1.4rem;
  }
}

.text-gradient {
  background: linear-gradient(45deg, rgb(118 170 227), #826ac9 30%, white 60%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400%;
  background-position: 0%;
}

.text {
  color: var(--color);
}

.icon-wrapper {
  color: #000;

  a {
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 0.6rem;
    display: inline-flex;
    font-size: 1.4rem;
    background: rgba(249, 250, 251, 0.6);
    color: #000;
    margin-right: 1rem;
  }
}

.hero-text {
  margin-top: 2rem;
  padding: 15px 20px;
  background: #f9f0d4;
  border-radius: 6px;
  color: #644006;
  line-height: 1.5;
  position: relative;

  &::before {
    content: "✍";
    font-size: 2.2rem;
    position: absolute;
    top: -32px;
  }
}

.my_status {
  margin-top: 2rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex-wrap: wrap;

  .status-item {
    flex: 1;

    img {
      width: 100%;
      height: auto;
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 1rem;
  }

  .left {
    position: static;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 1rem;

    .logo {
      width: 6rem;

      img {
        width: 6rem;
      }

      .emoji {
        width: 2.5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        font-size: 1.2rem;
      }
    }
  }

  .right {
    width: 100%;
    padding: 0;

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1.2rem;
    }
  }

  .my_status {
    flex-direction: column;

    .status-item {
      width: 100%;
    }
  }
}

@media screen and (max-width: 480px) {
  .icon-wrapper {
    a {
      padding: 0.3rem 0.6rem;
      font-size: 1.2rem;
    }
  }

  .hero-text {
    font-size: 0.9rem;
    padding: 10px 15px;

    &::before {
      font-size: 1.8rem;
      top: -25px;
    }
  }
}
</style>
