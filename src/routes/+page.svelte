<script>
import { request } from 'graphql-request';
const endpoint = 'http://127.0.0.1:5173/api/graphql';

/**
	 * @type {string | any[]}
	 */
let users = [];
let name = '';
let age = 0;
let email = '';
let complete = false;

  const updateUser = async (id, complete) => {
    const query = `
    mutation UpdateUserMutation($id: Int!, $complete: Boolean!) {
      updateUser(id: $id, complete: $complete) {
        complete
      }
    }
    `;
    const variables = { id, complete };
    const data = await request(endpoint, query, variables);
    return data.updateUser;
};
 const fetchUsers = async () => {
  const query = `
    query {
      users {
        id
        name
        email
        age
        complete
      }
    }
  `;
  try {
    const data = await request(endpoint, query);
    users = data.users;
   // console.log(users)
  } catch (error) {
    console.error(error);
  }
};
const createUser = async () => {
    const query = `
      mutation {
        createUser(name: "${name}", age: ${age}, email: "${email}", complete: ${complete}) {
          id
          name
          age
          email
          complete
        }
      }
    `;
    try {
      const data = await request(endpoint, query);
      console.log(data);
      name = '';
      age = 0;
      email = '';
      complete = false;
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  }

const deleteUserMutation = async (id) => {

  const query = `
    mutation DeleteUser($id: Int!) {
      deleteUser(id: $id) {
        id
        name
        age
        email
        complete
      }
    }
  `;

  const variables = { id };
  
  try {
    const data = await request(endpoint, query, variables);
    console.log(data);
    fetchUsers();
  } catch (error) {
    console.error(error);
    fetchUsers();
  }
};



fetchUsers();

</script>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<form>
{#if users.length > 0}
  <ul>
    {#each users as user}
    
      <li>{user.name} - {user.email} - Age: {user.age}</li>
      <label>
        <input type="checkbox" bind:checked={user.complete} on:change={async () => {
          try {
            await updateUser(user.id, user.complete);
          } catch (error) {
            console.error(error);
          }
        }}/>
        Complete
      </label>
      <button on:click={() => deleteUserMutation(user.id)}>DELETE</button>
  
    {/each}
 
  </ul>
{:else}
  <p>Loading...</p>
{/if}
</form>
<form on:submit|preventDefault={createUser}>
    <label>
      Name:
      <input type="text" bind:value={name} />
    </label>
    <label>
      Age:
      <input type="number" bind:value={age} />
    </label>
    <label>
      Email:
      <input type="email" bind:value={email} />
    </label>
    <label>
      Checked:
     <input type="checkbox" bind:checked={complete} on:change={async () => {
      try {
        await complete;
      } catch (error) {
        console.error(error);
      }
    }}/>
    </label>
    <button type="submit">Create User</button>
  </form>