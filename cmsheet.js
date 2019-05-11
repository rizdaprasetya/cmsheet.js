var cmsheet = (function() {
	class Helper{
		static isStringTruthy(str){
			// console.log('isStringTruthy:',str)
			switch(str){
				case null:
				case undefined:
				case false:
				case 0:
				case '':
				case 'false':
				case '0':
					return false
					break
				default:
					return true
			}
		}
		static readValueFromDataSet(selector){
			let doms = document.querySelectorAll('[data-'+selector+']')
			if(doms.length > 0){
				return doms[0].dataset[selector]
			}
			return null
		}
		/**
		 * Good enough deepMerge modified from https://stackoverflow.com/a/49798508
		 */
		static deepMerge(...sources) {
			let acc = {}
			for (const source of sources) {
				if (source instanceof Array) {
					if (!(acc instanceof Array)) {
						acc = []
					}
					acc = [...acc, ...source]
				} else if (source instanceof Object) {
					if (source instanceof Function){
						acc = source
					}
					for (let [key, value] of Object.entries(source)) {
						if (value instanceof Object && key in acc) {
							value = Helper.deepMerge(acc[key], value)
						}
						acc = { ...acc, [key]: value }
					}
				}
			}
			return acc
		}
	}

	class Cmsheet {

		constructor(options = {}) {
			let ef = function(){}
			this.sampleOptions =	{
				sheetId: null,
				autorun: 1,
				autoapply: 1,
				callback: { 
					onFinish: function(){},
					onBeforeApplyEach: function(){},
					onAfterApplyEach: function(){}
				},
				withGvizApi: 0
			}
			// config
			this._cf = {
				dataSetSelector: {
					dataGsheetId: 'cmsheet_gsheet_id',
					dataAutorun: 'cmsheet_autorun',
					dataAutoapply: 'cmsheet_autoapply',//TODO use this
					targetMutateDom: 'cmsheet',
					targetDataType: 'cmsheet_type',
					targetRowSpecify: 'cmsheet_row'
				},
				gSheetApiBaseUrl: 'https://spreadsheets.google.com/feeds/list',
				gSheetSheetId: '1',
				gSheetUrlSuffix: 'public/values?alt=json',
			}
			this.sheetId = ''
			this.sheetData = {}
			this.sheetDataRaw = {}
			this.autorun = false
			this.autoapply = true
			this.callback = {
				onFinish: ef,
				onBeforeApplyEach: function(el,data){ return { el:el, data:data } },
				onAfterApplyEach: function(el,data){ return { el:el, data:data } }
			}
			this.targetDoms = []
			this.mutateElementByContentType = { // TODO add other like img,href,etc
				default : function(el,data){ el.textContent=data; return { el:el, data:data } },
				string : function(el,data){ el.textContent=data; return { el:el, data:data } },
				text : function(el,data){ el.textContent=data; return { el:el, data:data } },
				html : function(el,data){ el.innerHTML=data; return { el:el, data:data } },
				outerhtml : function(el,data){ el.outerHTML=data; return { el:el, data:data } },
				image : function(el,data){ el.src=data; return { el:el, data:data } },
				src : function(el,data){ el.src=data; return { el:el, data:data } },
				href : function(el,data){ el.href=data; return { el:el, data:data } },
				link : function(el,data){ el.href=data; return { el:el, data:data } },
				hide : function(el,data){ el.style='display:none;'; return { el:el, data:data } }
			}
			this.withGvizApi = false
		}
		_generateGsheetUrl(){
			return `${this._cf.gSheetApiBaseUrl}/${this.sheetId}/${this._cf.gSheetSheetId}/${this._cf.gSheetUrlSuffix}`
		};
		_setGsheetIdFromDataSet(){
			return this.sheetId = Helper.readValueFromDataSet(this._cf.dataSetSelector.dataGsheetId)
		}
		_setAutorunFromDataSet(){
			let autorun = Helper.readValueFromDataSet(this._cf.dataSetSelector.dataAutorun)
			if(Helper.isStringTruthy(autorun)){
				return this.autorun = true
			}
			this.autorun = false
		}
		_generateGsheetUrlGviz(gvizQuery = ''){
			return `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?gid=0&tq=${gvizQuery}&tqx=responseHandler:cmsheet.jsonpCallback`
		}
		_fetchDataFromGsheetGvizThenJsonpCallback(gsheetUrl){
			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = gsheetUrl;
			document.getElementsByTagName('head')[0].appendChild(script);
		}
		jsonpCallback(data){
			this.sheetDataRaw = data
			this.sheetData = this._parseSheetDataGviz(data)
			this.targetDoms = this._getTargetMutateDoms()
			if(this.autoapply){
				this._mutateDom(this.targetDoms,this.sheetData,
					this.callback.onBeforeApplyEach,this.callback.onAfterApplyEach)
			}
			this.callback.onFinish(this)
		}
		_parseSheetDataGviz(raw){
			return (raw.table.rows).slice(1)
				.map(function(el){
					return el.c
						.map(function(el1){
							return el1 ? el1.v : null
						})
				})
		}
		_fetchDataFromGsheet(gsheetUrl){
			return new Promise( function(resolve,reject) {
				fetch(gsheetUrl)
					.then(function(response){ 
						return response.text()
					})
					.then(function(data){ 
						data = JSON.parse(data)
						console.log('fetched:',data)
						// console.log(JSON.stringify(data))
						return resolve(data)
					})
					.catch(function(e){
						console.log(`Error fetching to ${gsheetUrl} , with error:`,e)
						return reject(e)
					})
			})
		}
		_parseSheetData(raw){
			return raw.feed.entry.map(function(el){
				//TODO add more rows
				return [
					el.title.$t,
					el.gsx$type
				]
			})
		}
		_getTargetMutateDoms(){
			let targetDomsNodes = document.querySelectorAll(`[data-${this._cf.dataSetSelector.targetMutateDom}]`)
			if(!targetDomsNodes){
				return null
			}
			let targetDomsUnfiltered = Array.from(targetDomsNodes)
			let targetDoms = targetDomsUnfiltered.filter(function(el){
				return Helper.isStringTruthy(el.dataset.cmsheet)
			})
			return targetDoms
		}
		_mutateDom(targetDoms,sheetData,onBeforeApplyEach,onAfterApplyEach){
			let self = this
			targetDoms.forEach(function(el,idx) {
				idx = parseInt(el.dataset[self._cf.dataSetSelector.targetRowSpecify]) || idx
				// let el = targetDoms[idx]
				let data = sheetData[idx][0]
				let dataType = sheetData[idx][1]
				let dataTypeFromDom = el.dataset[self._cf.dataSetSelector.targetDataType]
				// set type from sheet `type` row
				dataType = Helper.isStringTruthy(dataType) ? dataType : 'default'
				// override from dom dataset-cmsheet_type
				dataType = Helper.isStringTruthy(dataTypeFromDom) ? dataTypeFromDom : dataType
				if (!self.mutateElementByContentType.hasOwnProperty(dataType)){
					dataType = 'default';
				}
				({ el, data } = onBeforeApplyEach(el,data) || { el:el, data:data });
				({ el, data } = self.mutateElementByContentType[dataType](el,data) || { el:el, data:data });
				({ el, data } = onAfterApplyEach(el,data) || { el:el, data:data });
			})
		}
		init(options = {}){
			if(!options.sheetId){
				this._setGsheetIdFromDataSet()
			}
			if(!options.autorun){ // TODO add for autoapply too?
				this._setAutorunFromDataSet() 
			}
			if(options){
				// merge options w/ attribute
				let mergedOptions = Helper.deepMerge(this,options)
				Object.assign(this, mergedOptions)
			}
			if(this.autorun){
				this.withGvizApi ?
					this.runGviz(): 
					this.run()
			}
			return this
		}
		async run(){
			let gsheetUrl = this._generateGsheetUrl()
			this.sheetDataRaw = await this._fetchDataFromGsheet(gsheetUrl)
			this.sheetData = this._parseSheetData(this.sheetDataRaw)
			this.targetDoms = this._getTargetMutateDoms()
			if(this.autoapply){
				this._mutateDom(this.targetDoms,this.sheetData,
					this.callback.onBeforeApplyEach,this.callback.onAfterApplyEach)
			}
			this.callback.onFinish(this)
		}
		runGviz(){
			let gsheetUrl = this._generateGsheetUrlGviz()
			this._fetchDataFromGsheetGvizThenJsonpCallback(gsheetUrl)
		}
	}
	let cmsheet = new Cmsheet();
	return cmsheet;

}());

// TODO
// add promisified fetch call [v]
// add user defined callback call [v]
// add templating capability?
// add autoread sheetId from script tag data attribute [v]
// add autorun from script tag data attribute [v]
// replace XHR with fetch [v]
// replace self & this with `private` var [v]
// allow sheet content type defined on the gsheet, 2nd row maybe [v]
// allow optional data attribute to specify which row and column to read for each element 
// change `mutateElementByContentType` from obj to arr of { dataType, val } [x]
// add sample usage
// add opt callback onBeforeEachReplace [v]
// add opt callback onAfterEachReplace [v]
// add opt callback onFinish [v]
// add dataset to override row [v]

// var testRunner = (function(){
// 	let cms = cmsheet.init({
// 		callback: {
// 			onFinish: function(c){ console.log('finished:',c.sheetDataRaw) },
// 			onBeforeApplyEach: function(el,data){return {el:el,data:data+'!!!'}},
// 			onAfterApplyEach: function(el,data){ console.log('onAfterApplyEach:',el,data) }
// 		}
// 	})
// 	console.log(cms)
// 	console.assert(cms.sheetId == '1wt1Nf5yV0ujRPf2wdGHm_Vj1QvbOsMvFCiNcw4Iw0Dw')
// 	console.assert(cms.autorun == true)
// }())
