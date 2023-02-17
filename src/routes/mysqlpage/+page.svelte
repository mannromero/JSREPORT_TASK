<script>
    import { request } from 'graphql-request';
    const endpoint = 'http://127.0.0.1:5173/api/graphql';
    
    /**
         * @type {string | any[]}
         */
    let persons = [];
    let name = '';
    let age = 0;
    let email = '';
    let complete = false;
    

const fetchUsers = async () => {
      const query = `
        query {
          persons {
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
        persons = data.persons;
        //console.log(persons)
      } catch (error) {
        console.error(error);
      }
};
fetchUsers();
const deleteUserMutation = async (/** @type {any} */ id) => {
 const query = `
  mutation DeleteUser($id: String!) {
    deletePerson(id: $id) {
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
const createUser = async () => {
    const query = `
      mutation {
        createPerson(name: "${name}", age: ${age}, email: "${email}", complete: ${complete}) {
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
};


const updatePerson = async (id, complete) => {
  const query = `
    mutation UpdateUserMutation($id: String!, $complete: Boolean!) {
      updatePerson(id: $id, complete: $complete) {
        complete
      }
    }
  `;
  
  try {
    const variables = { id, complete };
    const data = await request(endpoint, query, variables);
    return data.updatePerson;
  } catch (error) {
    console.error(error);
  }
};






</script>
    <h1>Welcome to SvelteKit</h1>
    <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
    <form>
    {#if persons.length > 0}
      <ul>
        {#each persons as person}
        
          <li>{person.name} - {person.email} - Age: {person.age}</li>
          <label>
            <input type="checkbox" bind:checked={person.complete} on:change = { async () => await updatePerson(person.id, person.complete)}/>
            Complete
          </label>
          <button on:click={() => deleteUserMutation(person.id)}>DELETE</button>
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