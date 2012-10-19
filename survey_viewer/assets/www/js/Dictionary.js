function createDictionary(object) {
	return new Dictionary(object);
}


function Dictionary(object) {
	var $this = this;
	this.dictionary = object;

	return {
		"map": function (mapper) {
			var result = {};
			for (var i in Object.keys($this.dictionary)) {
				result[i] = mapper($this.dictionary[i]);
			}
			return createDictionary(result);
		},
		"toObject": function () {
			return $this.dictionary;
		}
	}
}


