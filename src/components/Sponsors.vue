<template>
  <div class="sponsors">
    <h2 class="title">Liquidity providers</h2>
    <ul>
      <li v-for="icon in iconList" :key="icon.name">
        <a :href="icon.link"><img :src="icon.photoURL" :alt="icon.name" :title="icon.name" /></a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Sponsors',
  data() {
    return {
      iconList: [
        {
          name: 'YFI',
          photoURL: require('../assets/YFI.png'),
          link: 'https://yearn.finance',
        },
        {
          name: 'AC',
          photoURL: require('../assets/AC.png'),
          link: 'https://twitter.com/andrecronje',
        },
        {
          name: 'LIDO',
          photoURL: require('../assets/LIDO.png'),
          link: 'https://lido.fi',
        },
        {
          name: 'Mushroom',
          photoURL: require('../assets/Mushroom.png'),
          link: 'https://www.mushrooms.finance/',
        },
        {
          name: 'CRV',
          photoURL: require('../assets/CRV.png'),
          link: 'https://curve.fi/',
        },
        {
          name: 'HEGIC',
          photoURL: require('../assets/HEGIC.png'),
          link: 'https://www.hegic.co/',
        },
        {
          name: 'BZRX',
          photoURL: require('../assets/BZRX.png'),
          link: 'https://bzx.network/',
        },
      ],
    };
  },
  props: {
    icon: Object,
  },
};
</script>
