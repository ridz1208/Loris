!function(modules){function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={exports:{},id:moduleId,loaded:!1};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.loaded=!0,module.exports}var installedModules={};return __webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.p="",__webpack_require__(0)}([function(module,exports,__webpack_require__){"use strict";function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var _CandidateParameters=__webpack_require__(3),_CandidateParameters2=_interopRequireDefault(_CandidateParameters),args=QueryString.get(document.currentScript.src);$(function(){var candidateParameters=React.createElement("div",{className:"page-candidate-parameters"},React.createElement(_CandidateParameters2.default,{Module:"candidate_parameters",candID:args.candID}));ReactDOM.render(candidateParameters,document.getElementById("lorisworkspace"))})},,,function(module,exports,__webpack_require__){"use strict";function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(self,call){if(!self)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!call||"object"!=typeof call&&"function"!=typeof call?self:call}function _inherits(subClass,superClass){if("function"!=typeof superClass&&null!==superClass)throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:!1,writable:!0,configurable:!0}}),superClass&&(Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}(),_CandidateInfo=__webpack_require__(4),_CandidateInfo2=_interopRequireDefault(_CandidateInfo),_ProbandInfo=__webpack_require__(5),_ProbandInfo2=_interopRequireDefault(_ProbandInfo),_FamilyInfo=__webpack_require__(6),_FamilyInfo2=_interopRequireDefault(_FamilyInfo),_ParticipantStatus=__webpack_require__(7),_ParticipantStatus2=_interopRequireDefault(_ParticipantStatus),_ConsentStatus=__webpack_require__(8),_ConsentStatus2=_interopRequireDefault(_ConsentStatus),_Tabs=__webpack_require__(9),CandidateParameters=function(_React$Component){function CandidateParameters(){return _classCallCheck(this,CandidateParameters),_possibleConstructorReturn(this,(CandidateParameters.__proto__||Object.getPrototypeOf(CandidateParameters)).apply(this,arguments))}return _inherits(CandidateParameters,_React$Component),_createClass(CandidateParameters,[{key:"getTabPanes",value:function(tabList){var actionURL=loris.BaseURL+"/candidate_parameters/ajax/formHandler.php",dataURL=loris.BaseURL+"/candidate_parameters/ajax/getData.php?candID="+this.props.candID,tabPanes=Object.keys(tabList).map(function(key){var TabContent=tabList[key].component;return React.createElement(_Tabs.TabPane,{TabId:tabList[key].id,key:key},React.createElement(TabContent,{action:actionURL,dataURL:dataURL+"&data="+tabList[key].id,tabName:tabList[key].id}))});return tabPanes}},{key:"render",value:function(){var tabList=[{id:"candidateInfo",label:"Candidate Information",component:_CandidateInfo2.default},{id:"participantStatus",label:"Participant Status",component:_ParticipantStatus2.default}];return"true"===loris.config("useProband")&&tabList.push({id:"probandInfo",label:"Proband Information",component:_ProbandInfo2.default}),"true"===loris.config("useFamilyID")&&tabList.push({id:"familyInfo",label:"Family Information",component:_FamilyInfo2.default}),"true"===loris.config("useConsent")&&tabList.push({id:"consentStatus",label:"Consent Status",component:_ConsentStatus2.default}),React.createElement("div",null,React.createElement("a",{className:"btn btn-sm btn-primary",href:loris.BaseURL+"/timepoint_list/?candID="+this.props.candID,style:{marginBottom:"20px"}},"Return to timepoint list"),React.createElement("br",null),React.createElement(_Tabs.Tabs,{tabs:tabList,defaultTab:"candidateInfo",updateURL:!0},this.getTabPanes(tabList)))}}]),CandidateParameters}(React.Component);CandidateParameters.propTypes={},CandidateParameters.defaultProps={},exports.default=CandidateParameters},function(module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var CandidateInfo=React.createClass({displayName:"CandidateInfo",getInitialState:function(){return{caveatOptions:{true:"True",false:"False"},Data:[],formData:{},updateResult:null,errorMessage:null,isLoaded:!1,loadedData:0}},componentDidMount:function(){var that=this;$.ajax(this.props.dataURL,{dataType:"json",success:function(data){var formData={flaggedCaveatemptor:data.flagged_caveatemptor,flaggedOther:data.flagged_other,flaggedReason:data.flagged_reason};Object.assign(formData,data.parameter_values),that.setState({Data:data,isLoaded:!0,formData:formData})},error:function(data,errorCode,errorMsg){that.setState({error:"An error occurred when loading the form!"})}})},setFormData:function(formElement,value){var formData=JSON.parse(JSON.stringify(this.state.formData));formData[formElement]=value,"flaggedCaveatemptor"===formElement&&"false"===value&&(formData.flaggedReason="",formData.flaggedOther=""),"flaggedReason"===formElement&&"Other"!==this.state.Data.caveatReasonOptions[value]&&(formData.flaggedOther=""),this.setState({formData:formData})},onSubmit:function(e){e.preventDefault()},render:function(){if(!this.state.isLoaded)return void 0!==this.state.error?React.createElement("div",{className:"alert alert-danger text-center"},React.createElement("strong",null,this.state.error)):React.createElement("button",{className:"btn-info has-spinner"},"Loading",React.createElement("span",{className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"}));var disabled=!0,updateButton=null;loris.userHasPermission("candidate_parameter_edit")&&(disabled=!1,updateButton=React.createElement(ButtonElement,{label:"Update"}));var reasonDisabled=!0,reasonRequired=!1;"true"===this.state.formData.flaggedCaveatemptor&&(reasonDisabled=!1,reasonRequired=!0);var reasonKey=null,specifyOther=null,otherDisabled=!0,otherRequired=!1;for(var key in this.state.Data.caveatReasonOptions)if(this.state.Data.caveatReasonOptions.hasOwnProperty(key)&&"Other"===this.state.Data.caveatReasonOptions[key]){reasonKey=key;break}this.state.formData.flaggedReason===reasonKey&&(otherRequired=!0,otherDisabled=!1),"false"===this.state.formData.flaggedCaveatemptor&&(reasonDisabled=!0,reasonRequired=!1,otherDisabled=!0,otherRequired=!1),null!==reasonKey&&(specifyOther=React.createElement(TextareaElement,{label:"If Other, please specify",name:"flaggedOther",value:this.state.formData.flaggedOther,onUserInput:this.setFormData,ref:"flaggedOther",disabled:otherDisabled,required:otherRequired}));var extraParameterFields=[],extraParameters=this.state.Data.extra_parameters;for(var key2 in extraParameters)if(extraParameters.hasOwnProperty(key2)){var paramTypeID=extraParameters[key2].ParameterTypeID,name=paramTypeID,value=this.state.formData[paramTypeID];switch(extraParameters[key2].Type.substring(0,3)){case"enu":var types=extraParameters[key2].Type.substring(5);types=types.slice(0,-1),types=types.replace(/'/g,""),types=types.split(",");var selectOptions={};for(var key3 in types)types.hasOwnProperty(key3)&&(selectOptions[types[key3]]=types[key3]);extraParameterFields.push(React.createElement(SelectElement,{label:extraParameters[key2].Description,name:name,options:selectOptions,value:value,onUserInput:this.setFormData,ref:name,disabled:disabled,key:key2}));break;case"dat":extraParameterFields.push(React.createElement(DateElement,{label:extraParameters[key2].Description,name:name,value:value,onUserInput:this.setFormData,ref:name,disabled:disabled,key:key2}));break;default:extraParameterFields.push(React.createElement(TextareaElement,{label:extraParameters[key2].Description,name:name,value:value,onUserInput:this.setFormData,ref:name,disabled:disabled,key:key2}))}}var alertMessage="",alertClass="alert text-center hide";if(this.state.updateResult)if("success"===this.state.updateResult)alertClass="alert alert-success text-center",alertMessage="Update Successful!";else if("error"===this.state.updateResult){var errorMessage=this.state.errorMessage;alertClass="alert alert-danger text-center",alertMessage=errorMessage?errorMessage:"Failed to update!"}return React.createElement("div",{className:"row"},React.createElement("div",{className:alertClass,role:"alert",ref:"alert-message"},alertMessage),React.createElement(FormElement,{name:"candidateInfo",onSubmit:this.handleSubmit,ref:"form",class:"col-md-6"},React.createElement(StaticElement,{label:"PSCID",text:this.state.Data.pscid}),React.createElement(StaticElement,{label:"DCCID",text:this.state.Data.candID}),React.createElement(SelectElement,{label:"Caveat Emptor Flag for Candidate",name:"flaggedCaveatemptor",options:this.state.caveatOptions,value:this.state.formData.flaggedCaveatemptor,onUserInput:this.setFormData,ref:"flaggedCaveatemptor",disabled:disabled,required:!0}),React.createElement(SelectElement,{label:"Reason for Caveat Emptor Flag",name:"flaggedReason",options:this.state.Data.caveatReasonOptions,value:this.state.formData.flaggedReason,onUserInput:this.setFormData,ref:"flaggedReason",disabled:reasonDisabled,required:reasonRequired}),specifyOther,extraParameterFields,updateButton))},handleSubmit:function(e){e.preventDefault();var myFormData=this.state.formData,self=this,formData=new FormData;for(var key in myFormData)myFormData.hasOwnProperty(key)&&""!==myFormData[key]&&formData.append(key,myFormData[key]);formData.append("tab",this.props.tabName),formData.append("candID",this.state.Data.candID),$.ajax({type:"POST",url:self.props.action,data:formData,cache:!1,contentType:!1,processData:!1,success:function(data){self.setState({updateResult:"success"}),self.showAlertMessage()},error:function(err){if(""!==err.responseText){var errorMessage=JSON.parse(err.responseText).message;self.setState({updateResult:"error",errorMessage:errorMessage}),self.showAlertMessage()}}})},showAlertMessage:function(){var self=this;if(null!==this.refs["alert-message"]){var alertMsg=this.refs["alert-message"];$(alertMsg).fadeTo(2e3,500).delay(3e3).slideUp(500,function(){self.setState({updateResult:null})})}}});exports.default=CandidateInfo},function(module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var ProbandInfo=React.createClass({displayName:"ProbandInfo",getInitialState:function(){return{genderOptions:{Male:"Male",Female:"Female"},Data:[],formData:{},updateResult:null,errorMessage:null,isLoaded:!1,loadedData:0}},componentDidMount:function(){var that=this;$.ajax(this.props.dataURL,{dataType:"json",success:function(data){var formData={ProbandGender:data.ProbandGender,ProbandDoB:data.ProbandDoB,ProbandDoB2:data.ProbandDoB};that.setState({formData:formData,Data:data,isLoaded:!0})},error:function(data,errorCode,errorMsg){that.setState({error:"An error occurred when loading the form!"})}})},setFormData:function(formElement,value){var formData=this.state.formData;formData[formElement]=value,this.setState({formData:formData})},onSubmit:function(e){e.preventDefault()},render:function(){var _this=this;if(!this.state.isLoaded)return void 0!==this.state.error?React.createElement("div",{className:"alert alert-danger text-center"},React.createElement("strong",null,this.state.error)):React.createElement("button",{className:"btn-info has-spinner"},"Loading",React.createElement("span",{className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"}));var disabled=!0,updateButton=null;loris.userHasPermission("candidate_parameter_edit")&&(disabled=!1,updateButton=React.createElement(ButtonElement,{label:"Update"}));var dobRequired=!1,dob2Required=!1;null!==this.state.formData.ProbandGender&&(dobRequired=!0),null!==this.state.formData.ProbandDoB&&(dob2Required=!0);var extraParameters=this.state.Data.extra_parameters,extraParameterFields=extraParameters.map(function(extraParam){var paramTypeID=extraParam.ParameterTypeID,name="PTID"+paramTypeID,value=_this.state.Data.parameter_values[paramTypeID];switch(extraParam.Type.substring(0,3)){case"enu":var types=extraParam.Type.substring(5);types=types.slice(0,-1),types=types.replace(/'/g,""),types=types.split(",");var selectOptions={};return types.forEach(function(type){selectOptions[type]=type}),React.createElement(SelectElement,{label:extraParam.Description,name:name,options:selectOptions,value:value,onUserInput:_this.setFormData,ref:name,disabled:disabled});case"dat":return React.createElement(DateElement,{label:extraParam.Description,name:name,value:value,onUserInput:_this.setFormData,ref:name,disabled:disabled});default:return React.createElement(TextareaElement,{label:extraParam.Description,name:name,value:value,onUserInput:_this.setFormData,ref:name,disabled:disabled})}}),alertMessage="",alertClass="alert text-center hide";if(this.state.updateResult)if("success"===this.state.updateResult)alertClass="alert alert-success text-center",alertMessage="Update Successful!";else if("error"===this.state.updateResult){var errorMessage=this.state.errorMessage;alertClass="alert alert-danger text-center",alertMessage=errorMessage?errorMessage:"Failed to update!"}return React.createElement("div",{className:"row"},React.createElement("div",{className:alertClass,role:"alert",ref:"alert-message"},alertMessage),React.createElement(FormElement,{name:"probandInfo",onSubmit:this.handleSubmit,ref:"form",class:"col-md-6"},React.createElement(StaticElement,{label:"PSCID",text:this.state.Data.pscid}),React.createElement(StaticElement,{label:"DCCID",text:this.state.Data.candID}),React.createElement(SelectElement,{label:"Proband Gender",name:"ProbandGender",options:this.state.genderOptions,value:this.state.formData.ProbandGender,onUserInput:this.setFormData,ref:"ProbandGender",disabled:disabled,required:!0}),React.createElement(DateElement,{label:"DoB Proband",name:"ProbandDoB",value:this.state.formData.ProbandDoB,onUserInput:this.setFormData,ref:"ProbandDoB",disabled:disabled,required:dobRequired}),React.createElement(DateElement,{label:"Confirm DoB Proband",name:"ProbandDoB2",value:this.state.formData.ProbandDoB2,onUserInput:this.setFormData,ref:"ProbandDoB2",disabled:disabled,required:dob2Required}),React.createElement(StaticElement,{label:"Age Difference (months)",text:this.state.Data.ageDifference.toString()}),extraParameterFields,updateButton))},handleSubmit:function(e){e.preventDefault();var myFormData=this.state.formData,today=new Date,dd=today.getDate(),mm=today.getMonth()+1,yyyy=today.getFullYear();dd<10&&(dd="0"+dd),mm<10&&(mm="0"+mm),today=yyyy+"-"+mm+"-"+dd;var dob1=myFormData.ProbandDoB?myFormData.ProbandDoB:null,dob2=myFormData.ProbandDoB2?myFormData.ProbandDoB2:null;if(dob1!==dob2)return void alert("DOB do not match!");if(dob1>today)return void alert("Consent to study date cannot be later than today!");var self=this,formData=new FormData;for(var key in myFormData)""!==myFormData[key]&&formData.append(key,myFormData[key]);formData.append("tab",this.props.tabName),formData.append("candID",this.state.Data.candID),$.ajax({type:"POST",url:self.props.action,data:formData,cache:!1,contentType:!1,processData:!1,success:function(data){self.setState({updateResult:"success"}),self.showAlertMessage()},error:function(err){if(""!==err.responseText){var errorMessage=JSON.parse(err.responseText).message;self.setState({updateResult:"error",errorMessage:errorMessage}),self.showAlertMessage()}}})},showAlertMessage:function(){var self=this;if(null!==this.refs["alert-message"]){var alertMsg=this.refs["alert-message"];$(alertMsg).fadeTo(2e3,500).delay(3e3).slideUp(500,function(){self.setState({updateResult:null})})}}});exports.default=ProbandInfo},function(module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var FamilyInfo=React.createClass({displayName:"FamilyInfo",getInitialState:function(){return{Data:[],formData:{},familyMembers:[],updateResult:null,errorMessage:null,isLoaded:!1,loadedData:0}},componentDidMount:function(){var that=this;$.ajax(this.props.dataURL,{dataType:"json",xhr:function xhr(){var xhr=new window.XMLHttpRequest;return xhr.addEventListener("progress",function(evt){that.setState({loadedData:evt.loaded})}),xhr},success:function(data){that.setState({Data:data,isLoaded:!0,familyMembers:data.existingFamilyMembers})},error:function(data,errorCode,errorMsg){that.setState({error:"An error occurred when loading the form!"})}})},setFormData:function(formElement,value){var formData=this.state.formData;formData[formElement]=value,this.setState({formData:formData})},onSubmit:function(e){e.preventDefault()},render:function(){if(!this.state.isLoaded)return void 0!==this.state.error?React.createElement("div",{className:"alert alert-danger text-center"},React.createElement("strong",null,this.state.error)):React.createElement("button",{className:"btn-info has-spinner"},"Loading",React.createElement("span",{className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"}));var relationshipOptions={full_sibling:"Full Sibling",half_sibling:"Half Sibling","1st_cousin":"First Cousin"},disabled=!0,addButton=null;loris.userHasPermission("candidate_parameter_edit")&&(disabled=!1,addButton=React.createElement(ButtonElement,{label:"Add"}));var candidateList=this.state.Data.candidates,familyMembers=this.state.familyMembers,familyMembersHTML=[];for(var key in familyMembers)if(familyMembers.hasOwnProperty(key)){var candID=familyMembers[key].FamilyCandID,relationship=familyMembers[key].Relationship_type,link="?candID="+candID+"&identifier="+candID;familyMembersHTML.push(React.createElement("div",{key:key},React.createElement(StaticElement,{label:"Family Member DCCID",text:React.createElement("a",{href:link},candID)}),React.createElement(StaticElement,{label:"Relation Type",text:relationshipOptions[relationship]}),React.createElement(ButtonElement,{label:"Delete",type:"button",onUserInput:this.deleteFamilyMember.bind(null,candID,key,candidateList)}),React.createElement("hr",null))),delete candidateList[candID]}var alertMessage="",alertClass="alert text-center hide";if(this.state.updateResult)if("success"===this.state.updateResult)alertClass="alert alert-success text-center",alertMessage="Update Successful!";else if("error"===this.state.updateResult){var errorMessage=this.state.errorMessage;alertClass="alert alert-danger text-center",alertMessage=errorMessage?errorMessage:"Failed to update!"}return React.createElement("div",{className:"row"},React.createElement("div",{className:alertClass,role:"alert",ref:"alert-message"},alertMessage),React.createElement(FormElement,{name:"familyInfo",onSubmit:this.handleSubmit,ref:"form",class:"col-md-6"},React.createElement(StaticElement,{label:"PSCID",text:this.state.Data.pscid}),React.createElement(StaticElement,{label:"DCCID",text:this.state.Data.candID}),React.createElement("hr",null),familyMembersHTML,React.createElement(SelectElement,{label:"Family Member ID (DCCID)",name:"FamilyCandID",options:candidateList,onUserInput:this.setFormData,ref:"FamilyCandID",disabled:disabled,required:!0,value:this.state.formData.FamilyCandID}),React.createElement(SelectElement,{label:"Relation Type",name:"Relationship_type",options:relationshipOptions,onUserInput:this.setFormData,ref:"Relationship_type",disabled:disabled,required:!0,value:this.state.formData.Relationship_type}),addButton))},handleSubmit:function(e){e.preventDefault();var myFormData=this.state.formData,self=this,formData=new FormData,formRefs=this.refs,familyMembers=this.state.familyMembers,familyMember={};for(var key in myFormData)myFormData.hasOwnProperty(key)&&""!==myFormData[key]&&(familyMember[key]=myFormData[key],formData.append(key,myFormData[key]));formData.append("tab",this.props.tabName),formData.append("candID",this.state.Data.candID),familyMembers.push(familyMember),this.setState({familyMembers:familyMembers}),$.ajax({type:"POST",url:self.props.action,data:formData,cache:!1,contentType:!1,processData:!1,success:function(data){self.setState({updateResult:"success",formData:{}}),self.showAlertMessage(),Object.keys(formRefs).map(function(ref){formRefs[ref].state&&formRefs[ref].state.value&&(formRefs[ref].state.value="")}),self.forceUpdate()},error:function(err){var errorMessage=JSON.parse(err.responseText).message;self.setState({updateResult:"error",errorMessage:errorMessage}),self.showAlertMessage()}})},showAlertMessage:function(){var self=this;if(null!==this.refs["alert-message"]){var alertMsg=this.refs["alert-message"];$(alertMsg).fadeTo(2e3,500).delay(3e3).slideUp(500,function(){self.setState({updateResult:null})})}},deleteFamilyMember:function(candID,key,candidateList){var familyMembers=this.state.familyMembers;delete familyMembers[key],candidateList[candID]=candID,this.setState({familyMembers:familyMembers});var myFormData=this.state.formData,self=this,formData=new FormData;for(var _key in myFormData)myFormData.hasOwnProperty(_key)&&""!==myFormData[_key]&&formData.append(_key,myFormData[_key]);formData.append("tab","deleteFamilyMember"),formData.append("candID",this.state.Data.candID),formData.append("familyDCCID",candID),$.ajax({type:"POST",url:self.props.action,data:formData,cache:!1,contentType:!1,processData:!1,success:function(data){self.setState({updateResult:"success"}),self.showAlertMessage()},error:function(err){if(""!==err.responseText){var errorMessage=JSON.parse(err.responseText).message;self.setState({updateResult:"error",errorMessage:errorMessage}),self.showAlertMessage()}}})}});exports.default=FamilyInfo},function(module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var ParticipantStatus=React.createClass({displayName:"ParticipantStatus",getInitialState:function(){return{Data:[],formData:{},updateResult:null,errorMessage:null,isLoaded:!1,loadedData:0}},componentDidMount:function(){var that=this;$.ajax(this.props.dataURL,{dataType:"json",xhr:function xhr(){var xhr=new window.XMLHttpRequest;return xhr.addEventListener("progress",function(evt){that.setState({loadedData:evt.loaded})}),xhr},success:function(data){var formData={};formData.participantStatus=data.participantStatus,formData.participantSuboptions=data.participantSuboptions,formData.reasonSpecify=data.reasonSpecify,that.setState({Data:data,formData:formData,isLoaded:!0})},error:function(data,errorCode,errorMsg){that.setState({error:"An error occurred when loading the form!"})}})},setFormData:function(formElement,value){var formData=this.state.formData,required=this.state.Data.required;"participantStatus"===formElement&&required.indexOf(value)<0&&(formData.participantSuboptions=""),formData[formElement]=value,this.setState({formData:formData})},onSubmit:function(e){e.preventDefault()},render:function(){if(!this.state.isLoaded)return void 0!==this.state.error?React.createElement("div",{className:"alert alert-danger text-center"},React.createElement("strong",null,this.state.error)):React.createElement("button",{className:"btn-info has-spinner"},"Loading",React.createElement("span",{className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"}));var disabled=!0,updateButton=null;loris.userHasPermission("candidate_parameter_edit")&&(disabled=!1,updateButton=React.createElement(ButtonElement,{label:"Update"}));var required=this.state.Data.required,subOptions={},suboptionsRequired=!1,participantStatus=this.state.formData.participantStatus?this.state.formData.participantStatus:this.state.Data.participantStatus;participantStatus&&required.indexOf(participantStatus)>-1&&(subOptions=this.state.Data.parentIDs[participantStatus],suboptionsRequired=!0);var formattedHistory=[];for(var statusKey in this.state.Data.history)if(this.state.Data.history.hasOwnProperty(statusKey)){var line="";for(var field in this.state.Data.history[statusKey])if(this.state.Data.history[statusKey].hasOwnProperty(field)){var current=this.state.Data.history[statusKey][field];if(null!==current)switch(field){case"data_entry_date":line+="[",line+=current,line+="] ";break;case"entry_staff":line+=current,line+=" ";break;case"status":line+=" Status: ",line+=current,line+=" ";break;case"suboption":line+="Details: ",line+=current,line+=" ";break;case"reason_specify":line+="Comments: ",line+=current,line+=" "}}formattedHistory.push(React.createElement("p",{key:statusKey},line))}var alertMessage="",alertClass="alert text-center hide";if(this.state.updateResult)if("success"===this.state.updateResult)alertClass="alert alert-success text-center",alertMessage="Update Successful!";else if("error"===this.state.updateResult){var errorMessage=this.state.errorMessage;alertClass="alert alert-danger text-center",alertMessage=errorMessage?errorMessage:"Failed to update!"}return React.createElement("div",{className:"row"},React.createElement("div",{className:alertClass,role:"alert",ref:"alert-message"},alertMessage),React.createElement(FormElement,{name:"participantStatus",onSubmit:this.handleSubmit,ref:"form",class:"col-md-6"},React.createElement(StaticElement,{label:"PSCID",text:this.state.Data.pscid}),React.createElement(StaticElement,{label:"DCCID",text:this.state.Data.candID}),React.createElement(SelectElement,{label:"Participant Status",name:"participantStatus",options:this.state.Data.statusOptions,value:this.state.formData.participantStatus,onUserInput:this.setFormData,ref:"participantStatus",disabled:disabled,required:!0}),React.createElement(SelectElement,{label:"Specify Reason",name:"participantSuboptions",options:subOptions,value:this.state.formData.participantSuboptions,onUserInput:this.setFormData,ref:"participantSuboptions",disabled:!suboptionsRequired,required:suboptionsRequired}),React.createElement(TextareaElement,{label:"Comments",name:"reasonSpecify",value:this.state.formData.reasonSpecify,onUserInput:this.setFormData,ref:"reasonSpecify",disabled:disabled,required:!1}),updateButton,formattedHistory))},handleSubmit:function(e){e.preventDefault();var myFormData=this.state.formData,self=this,formData=new FormData;for(var key in myFormData)""!==myFormData[key]&&formData.append(key,myFormData[key]);formData.append("tab",this.props.tabName),formData.append("candID",this.state.Data.candID),$.ajax({type:"POST",url:self.props.action,data:formData,cache:!1,contentType:!1,processData:!1,success:function(data){self.setState({updateResult:"success"}),self.showAlertMessage()},error:function(err){if(""!==err.responseText){var errorMessage=JSON.parse(err.responseText).message;self.setState({updateResult:"error",errorMessage:errorMessage}),self.showAlertMessage()}}})},showAlertMessage:function(){var self=this;if(null!==this.refs["alert-message"]){var alertMsg=this.refs["alert-message"];$(alertMsg).fadeTo(2e3,500).delay(3e3).slideUp(500,function(){self.setState({updateResult:null})})}}});exports.default=ParticipantStatus},function(module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var ConsentStatus=React.createClass({displayName:"ConsentStatus",getInitialState:function(){return{consentOptions:{yes:"Yes",no:"No"},Data:[],formData:{},updateResult:null,errorMessage:null,isLoaded:!1,loadedData:0}},componentDidMount:function(){var that=this;$.ajax(this.props.dataURL,{dataType:"json",success:function(data){var formData={},consents=data.consents;for(var consentStatus in consents)if(consents.hasOwnProperty(consentStatus)){var consentDate=consentStatus+"_date",consentDate2=consentStatus+"_date2",consentWithdrawal=consentStatus+"_withdrawal",consentWithdrawal2=consentStatus+"_withdrawal2";formData[consentStatus]=data.consentStatuses[consentStatus],formData[consentDate]=data.consentDates[consentStatus],formData[consentDate2]=data.consentDates[consentStatus],formData[consentWithdrawal]=data.withdrawals[consentStatus],formData[consentWithdrawal2]=data.withdrawals[consentStatus]}that.setState({Data:data,formData:formData,isLoaded:!0})},error:function(data,errorCode,errorMsg){that.setState({error:"An error occurred when loading the form!"})}})},setFormData:function(formElement,value){var formData=this.state.formData;formData[formElement]=value,this.setState({formData:formData})},onSubmit:function(e){e.preventDefault()},render:function(){if(!this.state.isLoaded)return void 0!==this.state.error?React.createElement("div",{className:"alert alert-danger text-center"},React.createElement("strong",null,this.state.error)):React.createElement("button",{className:"btn-info has-spinner"},"Loading",React.createElement("span",{className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"}));var disabled=!0,updateButton=null;loris.userHasPermission("candidate_parameter_edit")&&(disabled=!1,updateButton=React.createElement(ButtonElement,{label:"Update"}));var dateRequired=[],withdrawalRequired=[],i=0;for(var consent in this.state.Data.consents)if(this.state.Data.consents.hasOwnProperty(consent)){var withdrawal=consent+"_withdrawal";"yes"===this.state.formData[consent]&&(dateRequired[i]=!0),this.state.formData[withdrawal]?withdrawalRequired[i]=!0:withdrawalRequired[i]=!1,i++}var consents=[];i=0;for(var consentStatus in this.state.Data.consents)if(this.state.Data.consents.hasOwnProperty(consentStatus)){var label=this.state.Data.consents[consentStatus],consentDate=consentStatus+"_date",consentDate2=consentStatus+"_date2",consentDateLabel="Date of "+label,consentDateConfirmationLabel="Confirmation Date of "+label,consentWithdrawal=consentStatus+"_withdrawal",consentWithdrawal2=consentStatus+"_withdrawal2",consentWithdrawalLabel="Date of Withdrawal of "+label,consentWithdrawalConfirmationLabel="Confirmation Date of Withdrawal of "+label,_consent=React.createElement("div",{key:i},React.createElement(SelectElement,{label:label,name:consentStatus,options:this.state.consentOptions,value:this.state.formData[consentStatus],onUserInput:this.setFormData,ref:consentStatus,disabled:disabled,required:!1}),React.createElement(DateElement,{label:consentDateLabel,name:consentDate,value:this.state.formData[consentDate],onUserInput:this.setFormData,ref:consentDate,disabled:disabled,required:dateRequired[i]}),React.createElement(DateElement,{label:consentDateConfirmationLabel,name:consentDate2,value:this.state.formData[consentDate2],onUserInput:this.setFormData,ref:consentDate2,disabled:disabled,required:dateRequired[i]}),React.createElement(DateElement,{label:consentWithdrawalLabel,name:consentWithdrawal,value:this.state.formData[consentWithdrawal],onUserInput:this.setFormData,ref:consentWithdrawal,disabled:disabled,required:!1}),React.createElement(DateElement,{label:consentWithdrawalConfirmationLabel,name:consentWithdrawal2,value:this.state.formData[consentWithdrawal2],onUserInput:this.setFormData,ref:consentWithdrawal2,disabled:disabled,required:withdrawalRequired[i]}),React.createElement("hr",null));consents.push(_consent),i++}var formattedHistory=[];for(var consentKey in this.state.Data.history)if(this.state.Data.history.hasOwnProperty(consentKey)){var consentLabel=this.state.Data.history[consentKey].label,consentType=this.state.Data.history[consentKey].consentType;for(var field in this.state.Data.history[consentKey])if(this.state.Data.history[consentKey].hasOwnProperty(field)){var line="",historyConsent=this.state.Data.history[consentKey][field];
for(var field2 in historyConsent)if(historyConsent.hasOwnProperty(field2)){var current=historyConsent[field2];if(null!==current)switch(field2){case"data_entry_date":line+="[",line+=current,line+="] ";break;case"entry_staff":line+=current,line+=" ";break;case consentType:line+=consentLabel+" Status: ",line+=current,line+=" ";break;case consentType+"_date":line+="Date of Consent: ",line+=current,line+=" ";break;case consentType+"_withdrawal":line+="Date of Consent Withdrawal: ",line+=current,line+=" "}}formattedHistory.push(React.createElement("p",{key:field},line))}}var alertMessage="",alertClass="alert text-center hide";if(this.state.updateResult)if("success"===this.state.updateResult)alertClass="alert alert-success text-center",alertMessage="Update Successful!";else if("error"===this.state.updateResult){var errorMessage=this.state.errorMessage;alertClass="alert alert-danger text-center",alertMessage=errorMessage?errorMessage:"Failed to update!"}return React.createElement("div",{className:"row"},React.createElement("div",{className:alertClass,role:"alert",ref:"alert-message"},alertMessage),React.createElement(FormElement,{name:"consentStatus",onSubmit:this.handleSubmit,ref:"form",class:"col-md-6"},React.createElement(StaticElement,{label:"PSCID",text:this.state.Data.pscid}),React.createElement(StaticElement,{label:"DCCID",text:this.state.Data.candID}),consents,updateButton,formattedHistory))},handleSubmit:function(e){e.preventDefault();var myFormData=this.state.formData,today=new Date,dd=today.getDate(),mm=today.getMonth()+1,yyyy=today.getFullYear();dd<10&&(dd="0"+dd),mm<10&&(mm="0"+mm),today=yyyy+"-"+mm+"-"+dd;for(var consentStatus in this.state.Data.consents)if(this.state.Data.consents.hasOwnProperty(consentStatus)){var label=this.state.Data.consents[consentStatus],consentDate=consentStatus+"_date",consentDate2=consentStatus+"_date2",date1=myFormData[consentDate]?myFormData[consentDate]:null,date2=myFormData[consentDate2]?myFormData[consentDate2]:null;if(date1!==date2)return void alert(label+" dates do not match!");if(date1>today)return void alert(label+" date cannot be later than today!");var consentWithdrawal=consentStatus+"_withdrawal",consentWithdrawal2=consentStatus+"_withdrawal2";if(date1=myFormData[consentWithdrawal]?myFormData[consentWithdrawal]:null,date2=myFormData[consentWithdrawal2]?myFormData[consentWithdrawal2]:null,date1!==date2)return void alert(label+" withdrawal dates do not match!");if(date1>today)return void alert(label+" withdrawal date cannot be later than today!")}var self=this,formData=new FormData;for(var key in myFormData)""!==myFormData[key]&&formData.append(key,myFormData[key]);formData.append("tab",this.props.tabName),formData.append("candID",this.state.Data.candID),$.ajax({type:"POST",url:self.props.action,data:formData,cache:!1,contentType:!1,processData:!1,success:function(data){self.setState({updateResult:"success"}),self.showAlertMessage()},error:function(err){if(""!==err.responseText){var errorMessage=JSON.parse(err.responseText).message;self.setState({updateResult:"error",errorMessage:errorMessage}),self.showAlertMessage()}}})},showAlertMessage:function(){var self=this;if(null!==this.refs["alert-message"]){var alertMsg=this.refs["alert-message"];$(alertMsg).fadeTo(2e3,500).delay(3e3).slideUp(500,function(){self.setState({updateResult:null})})}}});exports.default=ConsentStatus},function(module,exports){"use strict";function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(self,call){if(!self)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!call||"object"!=typeof call&&"function"!=typeof call?self:call}function _inherits(subClass,superClass){if("function"!=typeof superClass&&null!==superClass)throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:!1,writable:!0,configurable:!0}}),superClass&&(Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}(),Tabs=function(_React$Component){function Tabs(props){_classCallCheck(this,Tabs);var _this=_possibleConstructorReturn(this,(Tabs.__proto__||Object.getPrototypeOf(Tabs)).call(this,props)),hash=window.location.hash,activeTab="";return _this.props.updateURL&&hash?activeTab=hash.substr(1):_this.props.defaultTab?activeTab=_this.props.defaultTab:_this.props.tabs.length>0&&(activeTab=_this.props.tabs[0].id),_this.state={activeTab:activeTab},_this.handleClick=_this.handleClick.bind(_this),_this.getTabs=_this.getTabs.bind(_this),_this.getTabPanes=_this.getTabPanes.bind(_this),_this}return _inherits(Tabs,_React$Component),_createClass(Tabs,[{key:"handleClick",value:function(tabId,e){if(this.setState({activeTab:tabId}),this.props.onTabChange(tabId),this.props.updateURL){var scrollDistance=$("body").scrollTop()||$("html").scrollTop();window.location.hash=e.target.hash,$("html,body").scrollTop(scrollDistance)}}},{key:"getTabs",value:function(){var tabs=this.props.tabs.map(function(tab){var tabClass=this.state.activeTab===tab.id?"active":null,href="#"+tab.id,tabID="tab-"+tab.id;return React.createElement("li",{role:"presentation",className:tabClass,key:tab.id},React.createElement("a",{id:tabID,href:href,role:"tab","data-toggle":"tab",onClick:this.handleClick.bind(null,tab.id)},tab.label))}.bind(this));return tabs}},{key:"getTabPanes",value:function(){var tabPanes=React.Children.map(this.props.children,function(child,key){if(child)return React.cloneElement(child,{activeTab:this.state.activeTab,key:key})}.bind(this));return tabPanes}},{key:"render",value:function(){var tabs=this.getTabs(),tabPanes=this.getTabPanes(),tabStyle={marginLeft:0,marginBottom:"5px"};return React.createElement("div",null,React.createElement("ul",{className:"nav nav-tabs",role:"tablist",style:tabStyle},tabs),React.createElement("div",{className:"tab-content"},tabPanes))}}]),Tabs}(React.Component);Tabs.propTypes={tabs:React.PropTypes.array.isRequired,defaultTab:React.PropTypes.string,updateURL:React.PropTypes.bool},Tabs.defaultProps={onTabChange:function(){},updateURL:!1};var TabPane=function(_React$Component2){function TabPane(){return _classCallCheck(this,TabPane),_possibleConstructorReturn(this,(TabPane.__proto__||Object.getPrototypeOf(TabPane)).apply(this,arguments))}return _inherits(TabPane,_React$Component2),_createClass(TabPane,[{key:"render",value:function(){var classList="tab-pane",title=void 0;return this.props.TabId===this.props.activeTab&&(classList+=" active"),this.props.Title&&(title=React.createElement("h1",null,this.props.Title)),React.createElement("div",{role:"tabpanel",className:classList,id:this.props.TabId},title,this.props.children)}}]),TabPane}(React.Component);TabPane.propTypes={TabId:React.PropTypes.string.isRequired,Title:React.PropTypes.string,activeTab:React.PropTypes.string},exports.Tabs=Tabs,exports.TabPane=TabPane}]);
//# sourceMappingURL=index.js.map