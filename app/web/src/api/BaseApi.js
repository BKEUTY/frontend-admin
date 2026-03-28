import axiosClient from './axiosClient';

class BaseApi {
    constructor(resource, client = axiosClient) {
        this.resource = resource;
        this.client = client;
    }

    getAll(params = {}, config = {}) {
        return this.client.get(this.resource, { params, ...config });
    }

    getById(id, config = {}) {
        return this.client.get(`${this.resource}/${id}`, config);
    }

    getByName(name, config = {}) {
        return this.client.get(`${this.resource}/name/${name}`, config);
    }

    create(data, config = {}) {
        return this.client.post(this.resource, data, config);
    }

    update(id, data, config = {}) {
        return this.client.put(`${this.resource}/${id}`, data, config);
    }

    delete(id, config = {}) {
        return this.client.delete(`${this.resource}/${id}`, config);
    }
}

export default BaseApi;
