import publicApi from "./publicApi";

export async function getAllProducts(search, paginator) {
    try {
        const URL = `/items?page=${paginator.page}&perPage=${paginator.perPage}` + (search? `&name=${search}`: '');
        const response = await publicApi.get(URL);
        // console.log("(API) getAll post: ", response);
        return response.data;
    } catch(error) {
        // console.error("Error fetching posts:", error); 
        throw error;
    }
}

export async function getProduct(id) {
    try {
        const response = await publicApi.get(`/items/${id}`);
        // console.log("(API) getSingle product: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}