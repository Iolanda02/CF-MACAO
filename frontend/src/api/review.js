import protectedApi from "./protectedApi";

export async function createReview(newReview) {
    try {
        const response = await protectedApi.post(`/reviews`, newReview);
        // console.log("(API) createReview: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function updateReview(id, newData) {
    try {
        const URL = `/reviews/${id}`;
        const response = await protectedApi.put(URL, newData);
        // console.log("(API) updateReview: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function removeReview(id) {
    try {
        const response = await protectedApi.delete(`/reviews/${id}`);
        // console.log("(API) removeReview: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}