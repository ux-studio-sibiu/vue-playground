<template>
  <div>
    <BackgroundSlider />
    <div class="page-overlay">
      <OverlayMenu>
        <slot />
      </OverlayMenu>
    </div>
  </div>
</template>

<style scoped lang="scss" src="../app.scss"></style>
