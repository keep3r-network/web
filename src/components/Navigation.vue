<template>
  <div>
    <nav class="navigation">
      <ul>
        <li><router-link to="/">Keep3r</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li><router-link to="/governance">Governance</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
};
</script>
