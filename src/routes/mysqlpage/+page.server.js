export const actions = {
	// @ts-ignore
	printReceipt: async ({ fetch }) => {
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
		const postReq = await fetch('http://127.0.0.1:5173/api/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query })
		});

		const postResp = await postReq.json();
		console.log('data', postResp);
		if (postResp) {
			return postResp.data.persons;
		}
	}
};
