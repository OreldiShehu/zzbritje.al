import{r as o}from"./vendor-Dc3BUvRu.js";/*!
 * react-paypal-js v10.0.0 (2026-06-04T16:45:18.257Z)
 * Copyright 2020-present, PayPal, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var a;(function(r){r.INITIAL="initial",r.PENDING="pending",r.REJECTED="rejected",r.RESOLVED="resolved"})(a||(a={}));var p;(function(r){r.LOADING_STATUS="setLoadingStatus",r.RESET_OPTIONS="resetOptions",r.SET_BRAINTREE_INSTANCE="braintreeInstance"})(p||(p={}));var u;(function(r){r.NUMBER="number",r.CVV="cvv",r.EXPIRATION_DATE="expirationDate",r.EXPIRATION_MONTH="expirationMonth",r.EXPIRATION_YEAR="expirationYear",r.POSTAL_CODE="postalCode"})(u||(u={}));var i=function(r,t){return i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&(e[s]=n[s])},i(r,t)};function f(r,t){if(typeof t!="function"&&t!==null)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");i(r,t);function e(){this.constructor=r}r.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}o.createContext(null);o.createContext({});(function(r){f(t,r);function t(e){var n=r.call(this,e)||this;return n.state={hasError:!1},n}return t.getDerivedStateFromError=function(){return{hasError:!0}},t.prototype.componentDidCatch=function(e,n){console.error("Error in PayPalButtons component:",e,n),typeof this.props.onError=="function"&&this.props.onError({message:e.message,name:e.name,stack:e.stack,componentStack:n.componentStack})},t.prototype.render=function(){return this.state.hasError?null:this.props.children},t})(o.Component);function c(){}o.createContext({cardFieldsForm:null,fields:{},registerField:c,unregisterField:c});
