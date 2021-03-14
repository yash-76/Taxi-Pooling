class SampleService {
	constructor(db, mongoID) {
		this.db = db;
		this.mongoID = mongoID;
		this.sampleCollection = db.collection("sample");
		console.log('Sample Service created')
	}

	async addSample({ keyId, keySecret}) {
		await this.sampleCollection.insertOne({keyId, keySecret})
		
		console.log('post trigger');
		return { message: `success ${keyId}` };
	}

	async getSample() {
		const ans = await this.sampleCollection.findOne({});
		console.log(ans);

		console.log('get trigger');
		return { message: `success` };
	}

	async updateSample({ keyId, keySecret}) {
		console.log('get trigger');
		return { message: `success ${keyId}` };
	}

	async deleteSample() {
		console.log('get trigger');
		return { message: `success` };
	}
}

module.exports = SampleService
