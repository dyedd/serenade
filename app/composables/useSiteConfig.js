export const useSiteConfig = () => {
  const runtimeConfig = useRuntimeConfig()

  return runtimeConfig.public.siteConfig
}

