import protectedApi from "./protectedApi";
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


export async function createProduct(newProduct) {
    try {
        const response = await protectedApi.post(`/items`, newProduct);
        // console.log("(API) createProduct: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function updateProduct(id, newData) {
    try {
        const URL = `/items/${id}`;
        const response = await protectedApi.patch(URL, newData);
        // console.log("(API) updateProduct: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function removeProduct(id) {
    try {
        const response = await protectedApi.delete(`/items/${id}`);
        // console.log("(API) removeProduct: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function getItemVariantsByItemId(id) {
    try {
        const response = await publicApi.get(`/items/${id}/variants`);
        // console.log("(API) getItemVariantsByItemId: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function getReviewsByItemId(id) {
    try {
        const response = await publicApi.get(`/items/${id}/reviews`);
        // console.log("(API) getReviewsByItemId: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}



export async function addImages(id, fData) {
    try {
        const response = await protectedApi.patch(`/items/${id}/images`, fData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        );
        // console.log("(API) addImages: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function removeImage(productId, imageId) {
    try {
        const response = await protectedApi.delete(`/items/${productId}/images/${imageId}`);
        // console.log("(API) removeImage: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}