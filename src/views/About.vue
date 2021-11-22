<template>
  <div class="about page-content">
    <h1>This is an about page</h1>
    <h2>Components</h2>
    <Button size="small">Small button</Button>
    <Button size="medium">Medium button</Button>
    <Button size="large">Large button</Button>
    <Button disabled>Large button</Button>

    <br /><br />

    <Button @onClick="testAlert">Test alert</Button>
    <Button @onClick="testAlertInfo">Test alert info</Button>
    <Button @onClick="testAlertSuccess">Test alert sucess</Button>
    <Button @onClick="testAlertError">Test alert error</Button>
    <Button @onClick="testAlertPersistent">Test alert persistent</Button>

    <Search placeholder="Address/Name" label="Find job" />

    <Input placeholder="Amount" maxValue="9999" />
    <Input class="error" placeholder="Amount" maxValue="9999" />

    <Dropdown
      :options="[
        { value: 'KP3R-HEGIC1', tag: 'Sushi LP' },
        { value: 'KP3R-HEGIC1', tag: 'Sushi LP' },
      ]"
      :selected="{ value: 'KP3R-HEGIC1', tag: 'Sushi LP' }"
      class="select"
      size="single"
      @input="log($event)"
    />

    <Dropdown
      :options="[
        { value: 'KP3R-HEGIC1', tag: 'Sushi LP' },
        { value: 'KP3R-HEGIC1', tag: 'Sushi LP' },
      ]"
      :selected="{ value: 'KP3R-HEGIC1', tag: 'Sushi LP' }"
      class="select"
      size="double"
      @input="log($event)"
    />

    <Button theme="fill" size="small">Deposit</Button>
    <Button size="large" theme="fill" disabled>Deposit</Button>

    <EmptyList fill>Empty message</EmptyList>

    <Button size="small"><Loading /></Button>

    <Loading />

    <ListDots />

    <ListJobs />

    <Sponsors />
  </div>
</template>
<script>
// @ is an alias to /src
import Button from '@/components/Button.vue';
import Dropdown from '@/components/Dropdown.vue';
import EmptyList from '@/components/EmptyList.vue';
import Input from '@/components/Input.vue';
import ListJobs from '@/components/ListJobs.vue';
import ListDots from '@/components/ListDots.vue';
import Loading from '@/components/Loading.vue';
import Search from '@/components/Search.vue';
import Sponsors from '@/components/Sponsors.vue';

export default {
  name: 'About',
  components: {
    Button,
    Dropdown,
    EmptyList,
    Input,
    ListJobs,
    ListDots,
    Loading,
    Search,
    Sponsors,
  },
  methods: {
    testAlert() {
      this.$store.dispatch('alerts/openAlert', {
        message: 'All the Jobs That’s need to be done All the Jobs That’s need to be done',
      });
    },
    testAlertInfo() {
      this.$store.dispatch('alerts/openAlert', {
        type: 'info',
        message: 'All the Jobs That’s need to be done All the Jobs That’s need to be done',
      });
    },
    testAlertSuccess() {
      this.$store.dispatch('alerts/openAlert', {
        type: 'success',
        message: ' All the Jobs That’s need to be done All the Jobs That’s need to be done',
      });
    },
    testAlertError() {
      this.$store.dispatch('alerts/openAlert', {
        type: 'error',
        message: 'All the Jobs That’s need to be done',
        timeout: 1500,
      });
    },
    testAlertPersistent() {
      this.$store.dispatch('alerts/openAlert', { message: 'All the Jobs That’s need to be done', persistent: true });
    },
  },
};
</script>
