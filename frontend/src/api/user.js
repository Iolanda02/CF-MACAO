import protectedApi from "./protectedApi";

export async function getUser(id) {
    try {
        const response = await protectedApi.get(`/users/${id}`);
        // console.log("(API) getSingle user: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function editUser(id, newData) {
    try {
        const URL = `/users/${id}`;
        const response = await protectedApi.put(URL, newData);
        // console.log("(API) put user: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function remove(id) {
    try {
        const response = await protectedApi.delete(`/users/${id}`);
        // console.log("(API) delete user: ", response);
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

export async function addAvatar(id, fData) {
    try {
        const response = await axiosAuthenticated.patch(`users/${id}/avatar`, fData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        );
        // console.log("(API) addAvatar: ", response)
        return response.data;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}