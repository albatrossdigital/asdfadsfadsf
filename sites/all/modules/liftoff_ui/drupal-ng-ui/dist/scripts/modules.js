/**
 * @license AngularJS v1.0.8
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';
  /**
 * @ngdoc overview
 * @name ngResource
 * @description
 */
  /**
 * @ngdoc object
 * @name ngResource.$resource
 * @requires $http
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link ng.$http $http} service.
 *
 * # Installation
 * To use $resource make sure you have included the `angular-resource.js` that comes in Angular 
 * package. You can also find this file on Google CDN, bower as well as at
 * {@link http://code.angularjs.org/ code.angularjs.org}.
 *
 * Finally load the module in your application:
 *
 *        angular.module('app', ['ngResource']);
 *
 * and you are ready to get started!
 *
 * @param {string} url A parameterized URL template with parameters prefixed by `:` as in
 *   `/user/:username`. If you are using a URL with a port number (e.g. 
 *   `http://example.com:8080/api`), you'll need to escape the colon character before the port
 *   number, like this: `$resource('http://example.com\\:8080/api')`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods.
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@` then the value of that parameter is extracted from
 *   the data object (useful for non-GET operations).
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom action that should extend the
 *   default set of resource actions. The declaration should be created in the following format:
 *
 *       {action1: {method:?, params:?, isArray:?},
 *        action2: {method:?, params:?, isArray:?},
 *        ...}
 *
 *   Where:
 *
 *   - `action` – {string} – The name of action. This name becomes the name of the method on your
 *     resource object.
 *   - `method` – {string} – HTTP request method. Valid methods are: `GET`, `POST`, `PUT`, `DELETE`,
 *     and `JSONP`
 *   - `params` – {object=} – Optional set of pre-bound parameters for this action.
 *   - isArray – {boolean=} – If true then the returned object for this action is an array, see
 *     `returns` section.
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *
 *       { 'get':    {method:'GET'},
 *         'save':   {method:'POST'},
 *         'query':  {method:'GET', isArray:true},
 *         'remove': {method:'DELETE'},
 *         'delete': {method:'DELETE'} };
 *
 *   Calling these methods invoke an {@link ng.$http} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class. The actions `save`, `remove` and `delete` are available on it
 *   as  methods with the `$` prefix. This allows you to easily perform CRUD operations (create,
 *   read, update, delete) on server-side data like this:
 *   <pre>
        var User = $resource('/user/:userId', {userId:'@id'});
        var user = User.get({userId:123}, function() {
          user.abc = true;
          user.$save();
        });
     </pre>
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most case one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `Resource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `Resource.action([parameters], postData, [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *
 * @example
 *
 * # Credit card resource
 *
 * <pre>
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query(function() {
       // GET: /user/123/card
       // server returns: [ {id:456, number:'1234', name:'Smith'} ];

       var card = cards[0];
       // each item is an instance of CreditCard
       expect(card instanceof CreditCard).toEqual(true);
       card.name = "J. Smith";
       // non GET methods are mapped onto the instances
       card.$save();
       // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
       // server returns: {id:456, number:'1234', name: 'J. Smith'};

       // our custom method is mapped as well.
       card.$charge({amount:9.99});
       // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     });

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'01234', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * </pre>
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$http` on the `url` template with the given `method` and `params`.
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     var user = User.get({userId:123}, function() {
       user.abc = true;
       user.$save();
     });
   </pre>
 *
 * It's worth noting that the success callback for `get`, `query` and other method gets passed
 * in the response that came from the server as well as $http header getter function, so one
 * could rewrite the above example and get access to http headers as:
 *
   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(u, getResponseHeaders){
       u.abc = true;
       u.$save(function(u, putResponseHeaders) {
         //u => saved user object
         //putResponseHeaders => $http header getter
       });
     });
   </pre>

 * # Buzz client

   Let's look at what a buzz client created with the `$resource` service looks like:
    <doc:example>
      <doc:source jsfiddle="false">
       <script>
         function BuzzController($resource) {
           this.userId = 'googlebuzz';
           this.Activity = $resource(
             'https://www.googleapis.com/buzz/v1/activities/:userId/:visibility/:activityId/:comments',
             {alt:'json', callback:'JSON_CALLBACK'},
             {get:{method:'JSONP', params:{visibility:'@self'}}, replies: {method:'JSONP', params:{visibility:'@self', comments:'@comments'}}}
           );
         }

         BuzzController.prototype = {
           fetch: function() {
             this.activities = this.Activity.get({userId:this.userId});
           },
           expandReplies: function(activity) {
             activity.replies = this.Activity.replies({userId:this.userId, activityId:activity.id});
           }
         };
         BuzzController.$inject = ['$resource'];
       </script>

       <div ng-controller="BuzzController">
         <input ng-model="userId"/>
         <button ng-click="fetch()">fetch</button>
         <hr/>
         <div ng-repeat="item in activities.data.items">
           <h1 style="font-size: 15px;">
             <img src="{{item.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{item.actor.profileUrl}}">{{item.actor.name}}</a>
             <a href ng-click="expandReplies(item)" style="float: right;">Expand replies: {{item.links.replies[0].count}}</a>
           </h1>
           {{item.object.content | html}}
           <div ng-repeat="reply in item.replies.data.items" style="margin-left: 20px;">
             <img src="{{reply.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{reply.actor.profileUrl}}">{{reply.actor.name}}</a>: {{reply.content | html}}
           </div>
         </div>
       </div>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
  angular.module('ngResource', ['ng']).factory('$resource', [
    '$http',
    '$parse',
    function ($http, $parse) {
      var DEFAULT_ACTIONS = {
          'get': { method: 'GET' },
          'save': { method: 'POST' },
          'query': {
            method: 'GET',
            isArray: true
          },
          'remove': { method: 'DELETE' },
          'delete': { method: 'DELETE' }
        };
      var noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction, getter = function (obj, path) {
          return $parse(path)(obj);
        };
      /**
     * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
     * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
     * segments:
     *    segment       = *pchar
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
      function encodeUriSegment(val) {
        return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
      }
      /**
     * This method is intended for encoding *key* or *value* parts of query component. We need a custom
     * method becuase encodeURIComponent is too agressive and encodes stuff that doesn't have to be
     * encoded per http://tools.ietf.org/html/rfc3986:
     *    query       = *( pchar / "/" / "?" )
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
      }
      function Route(template, defaults) {
        this.template = template = template + '#';
        this.defaults = defaults || {};
        var urlParams = this.urlParams = {};
        forEach(template.split(/\W/), function (param) {
          if (param && new RegExp('(^|[^\\\\]):' + param + '\\W').test(template)) {
            urlParams[param] = true;
          }
        });
        this.template = template.replace(/\\:/g, ':');
      }
      Route.prototype = {
        url: function (params) {
          var self = this, url = this.template, val, encodedVal;
          params = params || {};
          forEach(this.urlParams, function (_, urlParam) {
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              encodedVal = encodeUriSegment(val);
              url = url.replace(new RegExp(':' + urlParam + '(\\W)', 'g'), encodedVal + '$1');
            } else {
              url = url.replace(new RegExp('(/?):' + urlParam + '(\\W)', 'g'), function (match, leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });
          url = url.replace(/\/?#$/, '');
          var query = [];
          forEach(params, function (value, key) {
            if (!self.urlParams[key]) {
              query.push(encodeUriQuery(key) + '=' + encodeUriQuery(value));
            }
          });
          query.sort();
          url = url.replace(/\/*$/, '');
          return url + (query.length ? '?' + query.join('&') : '');
        }
      };
      function ResourceFactory(url, paramDefaults, actions) {
        var route = new Route(url);
        actions = extend({}, DEFAULT_ACTIONS, actions);
        function extractParams(data, actionParams) {
          var ids = {};
          actionParams = extend({}, paramDefaults, actionParams);
          forEach(actionParams, function (value, key) {
            ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
          });
          return ids;
        }
        function Resource(value) {
          copy(value || {}, this);
        }
        forEach(actions, function (action, name) {
          action.method = angular.uppercase(action.method);
          var hasBody = action.method == 'POST' || action.method == 'PUT' || action.method == 'PATCH';
          Resource[name] = function (a1, a2, a3, a4) {
            var params = {};
            var data;
            var success = noop;
            var error = null;
            switch (arguments.length) {
            case 4:
              error = a4;
              success = a3;
            //fallthrough
            case 3:
            case 2:
              if (isFunction(a2)) {
                if (isFunction(a1)) {
                  success = a1;
                  error = a2;
                  break;
                }
                success = a2;
                error = a3;  //fallthrough
              } else {
                params = a1;
                data = a2;
                success = a3;
                break;
              }
            case 1:
              if (isFunction(a1))
                success = a1;
              else if (hasBody)
                data = a1;
              else
                params = a1;
              break;
            case 0:
              break;
            default:
              throw 'Expected between 0-4 arguments [params, data, success, error], got ' + arguments.length + ' arguments.';
            }
            var value = this instanceof Resource ? this : action.isArray ? [] : new Resource(data);
            $http({
              method: action.method,
              url: route.url(extend({}, extractParams(data, action.params || {}), params)),
              data: data
            }).then(function (response) {
              var data = response.data;
              if (data) {
                if (action.isArray) {
                  value.length = 0;
                  forEach(data, function (item) {
                    value.push(new Resource(item));
                  });
                } else {
                  copy(data, value);
                }
              }
              (success || noop)(value, response.headers);
            }, error);
            return value;
          };
          Resource.prototype['$' + name] = function (a1, a2, a3) {
            var params = extractParams(this), success = noop, error;
            switch (arguments.length) {
            case 3:
              params = a1;
              success = a2;
              error = a3;
              break;
            case 2:
            case 1:
              if (isFunction(a1)) {
                success = a1;
                error = a2;
              } else {
                params = a1;
                success = a2 || noop;
              }
            case 0:
              break;
            default:
              throw 'Expected between 1-3 arguments [params, success, error], got ' + arguments.length + ' arguments.';
            }
            var data = hasBody ? this : undefined;
            Resource[name].call(this, params, data, success, error);
          };
        });
        Resource.bind = function (additionalParamDefaults) {
          return ResourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
        };
        return Resource;
      }
      return ResourceFactory;
    }
  ]);
}(window, window.angular));
/**
 * @license AngularJS v1.0.8
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';
  /**
 * @ngdoc overview
 * @name ngCookies
 */
  angular.module('ngCookies', ['ng']).factory('$cookies', [
    '$rootScope',
    '$browser',
    function ($rootScope, $browser) {
      var cookies = {}, lastCookies = {}, lastBrowserCookies, runEval = false, copy = angular.copy, isUndefined = angular.isUndefined;
      //creates a poller fn that copies all cookies from the $browser to service & inits the service
      $browser.addPollFn(function () {
        var currentCookies = $browser.cookies();
        if (lastBrowserCookies != currentCookies) {
          //relies on browser.cookies() impl
          lastBrowserCookies = currentCookies;
          copy(currentCookies, lastCookies);
          copy(currentCookies, cookies);
          if (runEval)
            $rootScope.$apply();
        }
      })();
      runEval = true;
      //at the end of each eval, push cookies
      //TODO: this should happen before the "delayed" watches fire, because if some cookies are not
      //      strings or browser refuses to store some cookies, we update the model in the push fn.
      $rootScope.$watch(push);
      return cookies;
      /**
       * Pushes all the cookies from the service to the browser and verifies if all cookies were stored.
       */
      function push() {
        var name, value, browserCookies, updated;
        //delete any cookies deleted in $cookies
        for (name in lastCookies) {
          if (isUndefined(cookies[name])) {
            $browser.cookies(name, undefined);
          }
        }
        //update all cookies updated in $cookies
        for (name in cookies) {
          value = cookies[name];
          if (!angular.isString(value)) {
            if (angular.isDefined(lastCookies[name])) {
              cookies[name] = lastCookies[name];
            } else {
              delete cookies[name];
            }
          } else if (value !== lastCookies[name]) {
            $browser.cookies(name, value);
            updated = true;
          }
        }
        //verify what was actually stored
        if (updated) {
          updated = false;
          browserCookies = $browser.cookies();
          for (name in cookies) {
            if (cookies[name] !== browserCookies[name]) {
              //delete or reset all cookies that the browser dropped from $cookies
              if (isUndefined(browserCookies[name])) {
                delete cookies[name];
              } else {
                cookies[name] = browserCookies[name];
              }
              updated = true;
            }
          }
        }
      }
    }
  ]).factory('$cookieStore', [
    '$cookies',
    function ($cookies) {
      return {
        get: function (key) {
          var value = $cookies[key];
          return value ? angular.fromJson(value) : value;
        },
        put: function (key, value) {
          $cookies[key] = angular.toJson(value);
        },
        remove: function (key) {
          delete $cookies[key];
        }
      };
    }
  ]);
}(window, window.angular));
/**
 * @license AngularJS v1.0.8
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';
  /**
 * @ngdoc overview
 * @name ngSanitize
 * @description
 * 
 * The `ngSanitize` module provides functionality to sanitize HTML.
 * 
 * # Installation
 * As a separate module, it must be loaded after Angular core is loaded; otherwise, an 'Uncaught Error:
 * No module: ngSanitize' runtime error will occur.
 *
 * <pre>
 *   <script src="angular.js"></script>
 *   <script src="angular-sanitize.js"></script>
 * </pre>
 *
 * # Usage
 * To make sure the module is available to your application, declare it as a dependency of you application
 * module.
 *
 * <pre>
 *   angular.module('app', ['ngSanitize']);
 * </pre>
 */
  /*
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 */
  /**
 * @ngdoc service
 * @name ngSanitize.$sanitize
 * @function
 *
 * @description
 *   The input is sanitized by parsing the html into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string, however, since our parser is more strict than a typical browser
 *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
 *   browser, won't make it through the sanitizer.
 *
 * @param {string} html Html input.
 * @returns {string} Sanitized html.
 *
 * @example
   <doc:example module="ngSanitize">
     <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.snippet =
             '<p style="color:blue">an html\n' +
             '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
             'snippet</p>';
         }
       </script>
       <div ng-controller="Ctrl">
          Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
           <table>
             <tr>
               <td>Filter</td>
               <td>Source</td>
               <td>Rendered</td>
             </tr>
             <tr id="html-filter">
               <td>html filter</td>
               <td>
                 <pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre>
               </td>
               <td>
                 <div ng-bind-html="snippet"></div>
               </td>
             </tr>
             <tr id="escaped-html">
               <td>no filter</td>
               <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
               <td><div ng-bind="snippet"></div></td>
             </tr>
             <tr id="html-unsafe-filter">
               <td>unsafe html filter</td>
               <td><pre>&lt;div ng-bind-html-unsafe="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
               <td><div ng-bind-html-unsafe="snippet"></div></td>
             </tr>
           </table>
         </div>
     </doc:source>
     <doc:scenario>
       it('should sanitize the html snippet ', function() {
         expect(using('#html-filter').element('div').html()).
           toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
       });

       it('should escape snippet without any filter', function() {
         expect(using('#escaped-html').element('div').html()).
           toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
                "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
                "snippet&lt;/p&gt;");
       });

       it('should inline raw snippet if filtered as unsafe', function() {
         expect(using('#html-unsafe-filter').element("div").html()).
           toBe("<p style=\"color:blue\">an html\n" +
                "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
                "snippet</p>");
       });

       it('should update', function() {
         input('snippet').enter('new <b>text</b>');
         expect(using('#html-filter').binding('snippet')).toBe('new <b>text</b>');
         expect(using('#escaped-html').element('div').html()).toBe("new &lt;b&gt;text&lt;/b&gt;");
         expect(using('#html-unsafe-filter').binding("snippet")).toBe('new <b>text</b>');
       });
     </doc:scenario>
   </doc:example>
 */
  var $sanitize = function (html) {
    var buf = [];
    htmlParser(html, htmlSanitizeWriter(buf));
    return buf.join('');
  };
  // Regular Expressions for parsing tags and attributes
  var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/, END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\s*\//, COMMENT_REGEXP = /<!--(.*?)-->/g, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, URI_REGEXP = /^((ftp|https?):\/\/|mailto:|#)/i, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;
  // Match everything outside of normal chars and " (quote character)
  // Good source of info about elements and attributes
  // http://dev.w3.org/html5/spec/Overview.html#semantics
  // http://simon.html5.org/html-elements
  // Safe Void Elements - HTML5
  // http://dev.w3.org/html5/spec/Overview.html#void-elements
  var voidElements = makeMap('area,br,col,hr,img,wbr');
  // Elements that you can, intentionally, leave open (and which close themselves)
  // http://dev.w3.org/html5/spec/Overview.html#optional-tags
  var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'), optionalEndTagInlineElements = makeMap('rp,rt'), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);
  // Safe Block Elements - HTML5
  var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap('address,article,aside,' + 'blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,' + 'header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul'));
  // Inline Elements - HTML5
  var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,bdi,bdo,' + 'big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,' + 'span,strike,strong,sub,sup,time,tt,u,var'));
  // Special Elements (can contain anything)
  var specialElements = makeMap('script,style');
  var validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);
  //Attributes that have href and hence need to be sanitized
  var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
  var validAttrs = angular.extend({}, uriAttrs, makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' + 'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' + 'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' + 'scope,scrolling,shape,span,start,summary,target,title,type,' + 'valign,value,vspace,width'));
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
  /**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
  function htmlParser(html, handler) {
    var index, chars, match, stack = [], last = html;
    stack.last = function () {
      return stack[stack.length - 1];
    };
    while (html) {
      chars = true;
      // Make sure we're not in a script or style element
      if (!stack.last() || !specialElements[stack.last()]) {
        // Comment
        if (html.indexOf('<!--') === 0) {
          index = html.indexOf('-->');
          if (index >= 0) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }  // end tag
        } else if (BEGING_END_TAGE_REGEXP.test(html)) {
          match = html.match(END_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(END_TAG_REGEXP, parseEndTag);
            chars = false;
          }  // start tag
        } else if (BEGIN_TAG_REGEXP.test(html)) {
          match = html.match(START_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
            chars = false;
          }
        }
        if (chars) {
          index = html.indexOf('<');
          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? '' : html.substring(index);
          if (handler.chars)
            handler.chars(decodeEntities(text));
        }
      } else {
        html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.last() + '[^>]*>', 'i'), function (all, text) {
          text = text.replace(COMMENT_REGEXP, '$1').replace(CDATA_REGEXP, '$1');
          if (handler.chars)
            handler.chars(decodeEntities(text));
          return '';
        });
        parseEndTag('', stack.last());
      }
      if (html == last) {
        throw 'Parse Error: ' + html;
      }
      last = html;
    }
    // Clean up any remaining tags
    parseEndTag();
    function parseStartTag(tag, tagName, rest, unary) {
      tagName = angular.lowercase(tagName);
      if (blockElements[tagName]) {
        while (stack.last() && inlineElements[stack.last()]) {
          parseEndTag('', stack.last());
        }
      }
      if (optionalEndTagElements[tagName] && stack.last() == tagName) {
        parseEndTag('', tagName);
      }
      unary = voidElements[tagName] || !!unary;
      if (!unary)
        stack.push(tagName);
      var attrs = {};
      rest.replace(ATTR_REGEXP, function (match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
        var value = doubleQuotedValue || singleQuotedValue || unquotedValue || '';
        attrs[name] = decodeEntities(value);
      });
      if (handler.start)
        handler.start(tagName, attrs, unary);
    }
    function parseEndTag(tag, tagName) {
      var pos = 0, i;
      tagName = angular.lowercase(tagName);
      if (tagName)
        // Find the closest opened tag of the same type
        for (pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;
      if (pos >= 0) {
        // Close all the open elements, up the stack
        for (i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);
        // Remove the open elements from the stack
        stack.length = pos;
      }
    }
  }
  /**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 */
  var hiddenPre = document.createElement('pre');
  function decodeEntities(value) {
    hiddenPre.innerHTML = value.replace(/</g, '&lt;');
    return hiddenPre.innerText || hiddenPre.textContent || '';
  }
  /**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns escaped text
 */
  function encodeEntities(value) {
    return value.replace(/&/g, '&amp;').replace(NON_ALPHANUMERIC_REGEXP, function (value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
  function htmlSanitizeWriter(buf) {
    var ignore = false;
    var out = angular.bind(buf, buf.push);
    return {
      start: function (tag, attrs, unary) {
        tag = angular.lowercase(tag);
        if (!ignore && specialElements[tag]) {
          ignore = tag;
        }
        if (!ignore && validElements[tag] == true) {
          out('<');
          out(tag);
          angular.forEach(attrs, function (value, key) {
            var lkey = angular.lowercase(key);
            if (validAttrs[lkey] == true && (uriAttrs[lkey] !== true || value.match(URI_REGEXP))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out(unary ? '/>' : '>');
        }
      },
      end: function (tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] == true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
      chars: function (chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
    };
  }
  // define ngSanitize module and register $sanitize service
  angular.module('ngSanitize', []).value('$sanitize', $sanitize);
  /**
 * @ngdoc directive
 * @name ngSanitize.directive:ngBindHtml
 *
 * @description
 * Creates a binding that will sanitize the result of evaluating the `expression` with the
 * {@link ngSanitize.$sanitize $sanitize} service and innerHTML the result into the current element.
 *
 * See {@link ngSanitize.$sanitize $sanitize} docs for examples.
 *
 * @element ANY
 * @param {expression} ngBindHtml {@link guide/expression Expression} to evaluate.
 */
  angular.module('ngSanitize').directive('ngBindHtml', [
    '$sanitize',
    function ($sanitize) {
      return function (scope, element, attr) {
        element.addClass('ng-binding').data('$binding', attr.ngBindHtml);
        scope.$watch(attr.ngBindHtml, function ngBindHtmlWatchAction(value) {
          value = $sanitize(value);
          element.html(value || '');
        });
      };
    }
  ]);
  /**
 * @ngdoc filter
 * @name ngSanitize.filter:linky
 * @function
 *
 * @description
 *   Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
 *   plain email address links.
 *
 * @param {string} text Input text.
 * @returns {string} Html-linkified text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <doc:example module="ngSanitize">
     <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.snippet =
             'Pretty text with some links:\n'+
             'http://angularjs.org/,\n'+
             'mailto:us@somewhere.org,\n'+
             'another@somewhere.org,\n'+
             'and one more: ftp://127.0.0.1/.';
         }
       </script>
       <div ng-controller="Ctrl">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </doc:source>
     <doc:scenario>
       it('should linkify the snippet with urls', function() {
         expect(using('#linky-filter').binding('snippet | linky')).
           toBe('Pretty text with some links:&#10;' +
                '<a href="http://angularjs.org/">http://angularjs.org/</a>,&#10;' +
                '<a href="mailto:us@somewhere.org">us@somewhere.org</a>,&#10;' +
                '<a href="mailto:another@somewhere.org">another@somewhere.org</a>,&#10;' +
                'and one more: <a href="ftp://127.0.0.1/">ftp://127.0.0.1/</a>.');
       });

       it ('should not linkify snippet without the linky filter', function() {
         expect(using('#escaped-html').binding('snippet')).
           toBe("Pretty text with some links:\n" +
                "http://angularjs.org/,\n" +
                "mailto:us@somewhere.org,\n" +
                "another@somewhere.org,\n" +
                "and one more: ftp://127.0.0.1/.");
       });

       it('should update', function() {
         input('snippet').enter('new http://link.');
         expect(using('#linky-filter').binding('snippet | linky')).
           toBe('new <a href="http://link">http://link</a>.');
         expect(using('#escaped-html').binding('snippet')).toBe('new http://link.');
       });
     </doc:scenario>
   </doc:example>
 */
  angular.module('ngSanitize').filter('linky', function () {
    var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/, MAILTO_REGEXP = /^mailto:/;
    return function (text) {
      if (!text)
        return text;
      var match;
      var raw = text;
      var html = [];
      // TODO(vojta): use $sanitize instead
      var writer = htmlSanitizeWriter(html);
      var url;
      var i;
      while (match = raw.match(LINKY_URL_REGEXP)) {
        // We can not end in these as they are sometimes found at the end of the sentence
        url = match[0];
        // if we did not match ftp/http/mailto then assume mailto
        if (match[2] == match[3])
          url = 'mailto:' + url;
        i = match.index;
        writer.chars(raw.substr(0, i));
        writer.start('a', { href: url });
        writer.chars(match[0].replace(MAILTO_REGEXP, ''));
        writer.end('a');
        raw = raw.substring(i + match[0].length);
      }
      writer.chars(raw);
      return html.join('');
    };
  });
}(window, window.angular));
/**
 * State-based routing for AngularJS
 * @version v0.2.13
 * @link http://angular-ui.github.com/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/* commonjs package manager support (eg componentjs) */
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'ui.router';
}
(function (window, angular, undefined) {
  /*jshint globalstrict:true*/
  /*global angular:false*/
  'use strict';
  var isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
  function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, { prototype: parent }))(), extra);
  }
  function merge(dst) {
    forEach(arguments, function (obj) {
      if (obj !== dst) {
        forEach(obj, function (value, key) {
          if (!dst.hasOwnProperty(key))
            dst[key] = value;
        });
      }
    });
    return dst;
  }
  /**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
  function ancestors(first, second) {
    var path = [];
    for (var n in first.path) {
      if (first.path[n] !== second.path[n])
        break;
      path.push(first.path[n]);
    }
    return path;
  }
  /**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
  function objectKeys(object) {
    if (Object.keys) {
      return Object.keys(object);
    }
    var result = [];
    angular.forEach(object, function (val, key) {
      result.push(key);
    });
    return result;
  }
  /**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
  function indexOf(array, value) {
    if (Array.prototype.indexOf) {
      return array.indexOf(value, Number(arguments[2]) || 0);
    }
    var len = array.length >>> 0, from = Number(arguments[2]) || 0;
    from = from < 0 ? Math.ceil(from) : Math.floor(from);
    if (from < 0)
      from += len;
    for (; from < len; from++) {
      if (from in array && array[from] === value)
        return from;
    }
    return -1;
  }
  /**
 * Merges a set of parameters with all parameters inherited between the common parents of the
 * current state and a given destination state.
 *
 * @param {Object} currentParams The value of the current state parameters ($stateParams).
 * @param {Object} newParams The set of parameters which will be composited with inherited params.
 * @param {Object} $current Internal definition of object representing the current state.
 * @param {Object} $to Internal definition of object representing state to transition to.
 */
  function inheritParams(currentParams, newParams, $current, $to) {
    var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];
    for (var i in parents) {
      if (!parents[i].params)
        continue;
      parentParams = objectKeys(parents[i].params);
      if (!parentParams.length)
        continue;
      for (var j in parentParams) {
        if (indexOf(inheritList, parentParams[j]) >= 0)
          continue;
        inheritList.push(parentParams[j]);
        inherited[parentParams[j]] = currentParams[parentParams[j]];
      }
    }
    return extend({}, inherited, newParams);
  }
  /**
 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
 *
 * @param {Object} a The first object.
 * @param {Object} b The second object.
 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
 *                     it defaults to the list of keys in `a`.
 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
 */
  function equalForKeys(a, b, keys) {
    if (!keys) {
      keys = [];
      for (var n in a)
        keys.push(n);  // Used instead of Object.keys() for IE8 compatibility
    }
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (a[k] != b[k])
        return false;  // Not '===', values aren't necessarily normalized
    }
    return true;
  }
  /**
 * Returns the subset of an object, based on a list of keys.
 *
 * @param {Array} keys
 * @param {Object} values
 * @return {Boolean} Returns a subset of `values`.
 */
  function filterByKeys(keys, values) {
    var filtered = {};
    forEach(keys, function (name) {
      filtered[name] = values[name];
    });
    return filtered;
  }
  // like _.indexBy
  // when you know that your index values will be unique, or you want last-one-in to win
  function indexBy(array, propName) {
    var result = {};
    forEach(array, function (item) {
      result[item[propName]] = item;
    });
    return result;
  }
  // extracted from underscore.js
  // Return a copy of the object only containing the whitelisted properties.
  function pick(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    forEach(keys, function (key) {
      if (key in obj)
        copy[key] = obj[key];
    });
    return copy;
  }
  // extracted from underscore.js
  // Return a copy of the object omitting the blacklisted properties.
  function omit(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    for (var key in obj) {
      if (indexOf(keys, key) == -1)
        copy[key] = obj[key];
    }
    return copy;
  }
  function pluck(collection, key) {
    var result = isArray(collection) ? [] : {};
    forEach(collection, function (val, i) {
      result[i] = isFunction(key) ? key(val) : val[key];
    });
    return result;
  }
  function filter(collection, callback) {
    var array = isArray(collection);
    var result = array ? [] : {};
    forEach(collection, function (val, i) {
      if (callback(val, i)) {
        result[array ? result.length : i] = val;
      }
    });
    return result;
  }
  function map(collection, callback) {
    var result = isArray(collection) ? [] : {};
    forEach(collection, function (val, i) {
      result[i] = callback(val, i);
    });
    return result;
  }
  /**
 * @ngdoc overview
 * @name ui.router.util
 *
 * @description
 * # ui.router.util sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 *
 */
  angular.module('ui.router.util', ['ng']);
  /**
 * @ngdoc overview
 * @name ui.router.router
 * 
 * @requires ui.router.util
 *
 * @description
 * # ui.router.router sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 */
  angular.module('ui.router.router', ['ui.router.util']);
  /**
 * @ngdoc overview
 * @name ui.router.state
 * 
 * @requires ui.router.router
 * @requires ui.router.util
 *
 * @description
 * # ui.router.state sub-module
 *
 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 * 
 */
  angular.module('ui.router.state', [
    'ui.router.router',
    'ui.router.util'
  ]);
  /**
 * @ngdoc overview
 * @name ui.router
 *
 * @requires ui.router.state
 *
 * @description
 * # ui.router
 * 
 * ## The main module for ui.router 
 * There are several sub-modules included with the ui.router module, however only this module is needed
 * as a dependency within your angular app. The other modules are for organization purposes. 
 *
 * The modules are:
 * * ui.router - the main "umbrella" module
 * * ui.router.router - 
 * 
 * *You'll need to include **only** this module as the dependency within your angular app.*
 * 
 * <pre>
 * <!doctype html>
 * <html ng-app="myApp">
 * <head>
 *   <script src="js/angular.js"></script>
 *   <!-- Include the ui-router script -->
 *   <script src="js/angular-ui-router.min.js"></script>
 *   <script>
 *     // ...and add 'ui.router' as a dependency
 *     var myApp = angular.module('myApp', ['ui.router']);
 *   </script>
 * </head>
 * <body>
 * </body>
 * </html>
 * </pre>
 */
  angular.module('ui.router', ['ui.router.state']);
  angular.module('ui.router.compat', ['ui.router']);
  /**
 * @ngdoc object
 * @name ui.router.util.$resolve
 *
 * @requires $q
 * @requires $injector
 *
 * @description
 * Manages resolution of (acyclic) graphs of promises.
 */
  $Resolve.$inject = [
    '$q',
    '$injector'
  ];
  function $Resolve($q, $injector) {
    var VISIT_IN_PROGRESS = 1, VISIT_DONE = 2, NOTHING = {}, NO_DEPENDENCIES = [], NO_LOCALS = NOTHING, NO_PARENT = extend($q.when(NOTHING), {
        $$promises: NOTHING,
        $$values: NOTHING
      });
    /**
   * @ngdoc function
   * @name ui.router.util.$resolve#study
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Studies a set of invocables that are likely to be used multiple times.
   * <pre>
   * $resolve.study(invocables)(locals, parent, self)
   * </pre>
   * is equivalent to
   * <pre>
   * $resolve.resolve(invocables, locals, parent, self)
   * </pre>
   * but the former is more efficient (in fact `resolve` just calls `study` 
   * internally).
   *
   * @param {object} invocables Invocable objects
   * @return {function} a function to pass in locals, parent and self
   */
    this.study = function (invocables) {
      if (!isObject(invocables))
        throw new Error('\'invocables\' must be an object');
      var invocableKeys = objectKeys(invocables || {});
      // Perform a topological sort of invocables to build an ordered plan
      var plan = [], cycle = [], visited = {};
      function visit(value, key) {
        if (visited[key] === VISIT_DONE)
          return;
        cycle.push(key);
        if (visited[key] === VISIT_IN_PROGRESS) {
          cycle.splice(0, indexOf(cycle, key));
          throw new Error('Cyclic dependency: ' + cycle.join(' -> '));
        }
        visited[key] = VISIT_IN_PROGRESS;
        if (isString(value)) {
          plan.push(key, [function () {
              return $injector.get(value);
            }], NO_DEPENDENCIES);
        } else {
          var params = $injector.annotate(value);
          forEach(params, function (param) {
            if (param !== key && invocables.hasOwnProperty(param))
              visit(invocables[param], param);
          });
          plan.push(key, value, params);
        }
        cycle.pop();
        visited[key] = VISIT_DONE;
      }
      forEach(invocables, visit);
      invocables = cycle = visited = null;
      // plan is all that's required
      function isResolve(value) {
        return isObject(value) && value.then && value.$$promises;
      }
      return function (locals, parent, self) {
        if (isResolve(locals) && self === undefined) {
          self = parent;
          parent = locals;
          locals = null;
        }
        if (!locals)
          locals = NO_LOCALS;
        else if (!isObject(locals)) {
          throw new Error('\'locals\' must be an object');
        }
        if (!parent)
          parent = NO_PARENT;
        else if (!isResolve(parent)) {
          throw new Error('\'parent\' must be a promise returned by $resolve.resolve()');
        }
        // To complete the overall resolution, we have to wait for the parent
        // promise and for the promise for each invokable in our plan.
        var resolution = $q.defer(), result = resolution.promise, promises = result.$$promises = {}, values = extend({}, locals), wait = 1 + plan.length / 3, merged = false;
        function done() {
          // Merge parent values we haven't got yet and publish our own $$values
          if (!--wait) {
            if (!merged)
              merge(values, parent.$$values);
            result.$$values = values;
            result.$$promises = result.$$promises || true;
            // keep for isResolve()
            delete result.$$inheritedValues;
            resolution.resolve(values);
          }
        }
        function fail(reason) {
          result.$$failure = reason;
          resolution.reject(reason);
        }
        // Short-circuit if parent has already failed
        if (isDefined(parent.$$failure)) {
          fail(parent.$$failure);
          return result;
        }
        if (parent.$$inheritedValues) {
          merge(values, omit(parent.$$inheritedValues, invocableKeys));
        }
        // Merge parent values if the parent has already resolved, or merge
        // parent promises and wait if the parent resolve is still in progress.
        extend(promises, parent.$$promises);
        if (parent.$$values) {
          merged = merge(values, omit(parent.$$values, invocableKeys));
          result.$$inheritedValues = omit(parent.$$values, invocableKeys);
          done();
        } else {
          if (parent.$$inheritedValues) {
            result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys);
          }
          parent.then(done, fail);
        }
        // Process each invocable in the plan, but ignore any where a local of the same name exists.
        for (var i = 0, ii = plan.length; i < ii; i += 3) {
          if (locals.hasOwnProperty(plan[i]))
            done();
          else
            invoke(plan[i], plan[i + 1], plan[i + 2]);
        }
        function invoke(key, invocable, params) {
          // Create a deferred for this invocation. Failures will propagate to the resolution as well.
          var invocation = $q.defer(), waitParams = 0;
          function onfailure(reason) {
            invocation.reject(reason);
            fail(reason);
          }
          // Wait for any parameter that we have a promise for (either from parent or from this
          // resolve; in that case study() will have made sure it's ordered before us in the plan).
          forEach(params, function (dep) {
            if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
              waitParams++;
              promises[dep].then(function (result) {
                values[dep] = result;
                if (!--waitParams)
                  proceed();
              }, onfailure);
            }
          });
          if (!waitParams)
            proceed();
          function proceed() {
            if (isDefined(result.$$failure))
              return;
            try {
              invocation.resolve($injector.invoke(invocable, self, values));
              invocation.promise.then(function (result) {
                values[key] = result;
                done();
              }, onfailure);
            } catch (e) {
              onfailure(e);
            }
          }
          // Publish promise synchronously; invocations further down in the plan may depend on it.
          promises[key] = invocation.promise;
        }
        return result;
      };
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$resolve#resolve
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Resolves a set of invocables. An invocable is a function to be invoked via 
   * `$injector.invoke()`, and can have an arbitrary number of dependencies. 
   * An invocable can either return a value directly,
   * or a `$q` promise. If a promise is returned it will be resolved and the 
   * resulting value will be used instead. Dependencies of invocables are resolved 
   * (in this order of precedence)
   *
   * - from the specified `locals`
   * - from another invocable that is part of this `$resolve` call
   * - from an invocable that is inherited from a `parent` call to `$resolve` 
   *   (or recursively
   * - from any ancestor `$resolve` of that parent).
   *
   * The return value of `$resolve` is a promise for an object that contains 
   * (in this order of precedence)
   *
   * - any `locals` (if specified)
   * - the resolved return values of all injectables
   * - any values inherited from a `parent` call to `$resolve` (if specified)
   *
   * The promise will resolve after the `parent` promise (if any) and all promises 
   * returned by injectables have been resolved. If any invocable 
   * (or `$injector.invoke`) throws an exception, or if a promise returned by an 
   * invocable is rejected, the `$resolve` promise is immediately rejected with the 
   * same error. A rejection of a `parent` promise (if specified) will likewise be 
   * propagated immediately. Once the `$resolve` promise has been rejected, no 
   * further invocables will be called.
   * 
   * Cyclic dependencies between invocables are not permitted and will caues `$resolve`
   * to throw an error. As a special case, an injectable can depend on a parameter 
   * with the same name as the injectable, which will be fulfilled from the `parent` 
   * injectable of the same name. This allows inherited values to be decorated. 
   * Note that in this case any other injectable in the same `$resolve` with the same
   * dependency would see the decorated value, not the inherited value.
   *
   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an 
   * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous) 
   * exception.
   *
   * Invocables are invoked eagerly as soon as all dependencies are available. 
   * This is true even for dependencies inherited from a `parent` call to `$resolve`.
   *
   * As a special case, an invocable can be a string, in which case it is taken to 
   * be a service name to be passed to `$injector.get()`. This is supported primarily 
   * for backwards-compatibility with the `resolve` property of `$routeProvider` 
   * routes.
   *
   * @param {object} invocables functions to invoke or 
   * `$injector` services to fetch.
   * @param {object} locals  values to make available to the injectables
   * @param {object} parent  a promise returned by another call to `$resolve`.
   * @param {object} self  the `this` for the invoked methods
   * @return {object} Promise for an object that contains the resolved return value
   * of all invocables, as well as any inherited and local values.
   */
    this.resolve = function (invocables, locals, parent, self) {
      return this.study(invocables)(locals, parent, self);
    };
  }
  angular.module('ui.router.util').service('$resolve', $Resolve);
  /**
 * @ngdoc object
 * @name ui.router.util.$templateFactory
 *
 * @requires $http
 * @requires $templateCache
 * @requires $injector
 *
 * @description
 * Service. Manages loading of templates.
 */
  $TemplateFactory.$inject = [
    '$http',
    '$templateCache',
    '$injector'
  ];
  function $TemplateFactory($http, $templateCache, $injector) {
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromConfig
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a configuration object. 
   *
   * @param {object} config Configuration object for which to load a template. 
   * The following properties are search in the specified order, and the first one 
   * that is defined is used to create the template:
   *
   * @param {string|object} config.template html string template or function to 
   * load via {@link ui.router.util.$templateFactory#fromString fromString}.
   * @param {string|object} config.templateUrl url to load or a function returning 
   * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
   * @param {Function} config.templateProvider function to invoke via 
   * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
   * @param {object} params  Parameters to pass to the template function.
   * @param {object} locals Locals to pass to `invoke` if the template is loaded 
   * via a `templateProvider`. Defaults to `{ params: params }`.
   *
   * @return {string|object}  The template html as a string, or a promise for 
   * that string,or `null` if no template is configured.
   */
    this.fromConfig = function (config, params, locals) {
      return isDefined(config.template) ? this.fromString(config.template, params) : isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) : isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) : null;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromString
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a string or a function returning a string.
   *
   * @param {string|object} template html template as a string or function that 
   * returns an html template as a string.
   * @param {object} params Parameters to pass to the template function.
   *
   * @return {string|object} The template html as a string, or a promise for that 
   * string.
   */
    this.fromString = function (template, params) {
      return isFunction(template) ? template(params) : template;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromUrl
   * @methodOf ui.router.util.$templateFactory
   * 
   * @description
   * Loads a template from the a URL via `$http` and `$templateCache`.
   *
   * @param {string|Function} url url of the template to load, or a function 
   * that returns a url.
   * @param {Object} params Parameters to pass to the url function.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
    this.fromUrl = function (url, params) {
      if (isFunction(url))
        url = url(params);
      if (url == null)
        return null;
      else
        return $http.get(url, {
          cache: $templateCache,
          headers: { Accept: 'text/html' }
        }).then(function (response) {
          return response.data;
        });
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromProvider
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template by invoking an injectable provider function.
   *
   * @param {Function} provider Function to invoke via `$injector.invoke`
   * @param {Object} params Parameters for the template.
   * @param {Object} locals Locals to pass to `invoke`. Defaults to 
   * `{ params: params }`.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
    this.fromProvider = function (provider, params, locals) {
      return $injector.invoke(provider, null, locals || { params: params });
    };
  }
  angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);
  var $$UMFP;
  // reference to $UrlMatcherFactoryProvider
  /**
 * @ngdoc object
 * @name ui.router.util.type:UrlMatcher
 *
 * @description
 * Matches URLs against patterns and extracts named parameters from the path or the search
 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
 * do not influence whether or not a URL is matched, but their values are passed through into
 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
 * 
 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
 * syntax, which optionally allows a regular expression for the parameter to be specified:
 *
 * * `':'` name - colon placeholder
 * * `'*'` name - catch-all placeholder
 * * `'{' name '}'` - curly placeholder
 * * `'{' name ':' regexp|type '}'` - curly placeholder with regexp or type name. Should the
 *   regexp itself contain curly braces, they must be in matched pairs or escaped with a backslash.
 *
 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
 * must be unique within the pattern (across both path and search parameters). For colon 
 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
 * number of characters other than '/'. For catch-all placeholders the path parameter matches
 * any number of characters.
 * 
 * Examples:
 * 
 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
 * * `'/user/{id:[^/]*}'` - Same as the previous example.
 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
 *   parameter consists of 1 to 8 hex digits.
 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
 *   path into the parameter 'path'.
 * * `'/files/*path'` - ditto.
 * * `'/calendar/{start:date}'` - Matches "/calendar/2014-11-12" (because the pattern defined
 *   in the built-in  `date` Type matches `2014-11-12`) and provides a Date object in $stateParams.start
 *
 * @param {string} pattern  The pattern to compile into a matcher.
 * @param {Object} config  A configuration object hash:
 * @param {Object=} parentMatcher Used to concatenate the pattern/config onto
 *   an existing UrlMatcher
 *
 * * `caseInsensitive` - `true` if URL matching should be case insensitive, otherwise `false`, the default value (for backward compatibility) is `false`.
 * * `strict` - `false` if matching against a URL with a trailing slash should be treated as equivalent to a URL without a trailing slash, the default value is `true`.
 *
 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
 *   non-null) will start with this prefix.
 *
 * @property {string} source  The pattern that was passed into the constructor
 *
 * @property {string} sourcePath  The path portion of the source property
 *
 * @property {string} sourceSearch  The search portion of the source property
 *
 * @property {string} regex  The constructed regex that will be used to match against the url when 
 *   it is time to determine which url will match.
 *
 * @returns {Object}  New `UrlMatcher` object
 */
  function UrlMatcher(pattern, config, parentMatcher) {
    config = extend({ params: {} }, isObject(config) ? config : {});
    // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
    //   '*' name
    //   ':' name
    //   '{' name '}'
    //   '{' name ':' regexp '}'
    // The regular expression is somewhat complicated due to the need to allow curly braces
    // inside the regular expression. The placeholder regexp breaks down as follows:
    //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
    //    \{([\w\[\]]+)(?:\:( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
    //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
    //    [^{}\\]+                       - anything other than curly braces or backslash
    //    \\.                            - a backslash escape
    //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
    var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, searchPlaceholder = /([:]?)([\w\[\]-]+)|\{([\w\[\]-]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, compiled = '^', last = 0, m, segments = this.segments = [], parentParams = parentMatcher ? parentMatcher.params : {}, params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(), paramNames = [];
    function addParameter(id, type, config, location) {
      paramNames.push(id);
      if (parentParams[id])
        return parentParams[id];
      if (!/^\w+(-+\w+)*(?:\[\])?$/.test(id))
        throw new Error('Invalid parameter name \'' + id + '\' in pattern \'' + pattern + '\'');
      if (params[id])
        throw new Error('Duplicate parameter name \'' + id + '\' in pattern \'' + pattern + '\'');
      params[id] = new $$UMFP.Param(id, type, config, location);
      return params[id];
    }
    function quoteRegExp(string, pattern, squash) {
      var surroundPattern = [
          '',
          ''
        ], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, '\\$&');
      if (!pattern)
        return result;
      switch (squash) {
      case false:
        surroundPattern = [
          '(',
          ')'
        ];
        break;
      case true:
        surroundPattern = [
          '?(',
          ')?'
        ];
        break;
      default:
        surroundPattern = [
          '(' + squash + '|',
          ')?'
        ];
        break;
      }
      return result + surroundPattern[0] + pattern + surroundPattern[1];
    }
    this.source = pattern;
    // Split into static segments separated by path parameter placeholders.
    // The number of segments is always 1 more than the number of parameters.
    function matchDetails(m, isSearch) {
      var id, regexp, segment, type, cfg, arrayMode;
      id = m[2] || m[3];
      // IE[78] returns '' for unmatched groups instead of null
      cfg = config.params[id];
      segment = pattern.substring(last, m.index);
      regexp = isSearch ? m[4] : m[4] || (m[1] == '*' ? '.*' : null);
      type = $$UMFP.type(regexp || 'string') || inherit($$UMFP.type('string'), { pattern: new RegExp(regexp) });
      return {
        id: id,
        regexp: regexp,
        segment: segment,
        type: type,
        cfg: cfg
      };
    }
    var p, param, segment;
    while (m = placeholder.exec(pattern)) {
      p = matchDetails(m, false);
      if (p.segment.indexOf('?') >= 0)
        break;
      // we're into the search part
      param = addParameter(p.id, p.type, p.cfg, 'path');
      compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash);
      segments.push(p.segment);
      last = placeholder.lastIndex;
    }
    segment = pattern.substring(last);
    // Find any search parameter names and remove them from the last segment
    var i = segment.indexOf('?');
    if (i >= 0) {
      var search = this.sourceSearch = segment.substring(i);
      segment = segment.substring(0, i);
      this.sourcePath = pattern.substring(0, last + i);
      if (search.length > 0) {
        last = 0;
        while (m = searchPlaceholder.exec(search)) {
          p = matchDetails(m, true);
          param = addParameter(p.id, p.type, p.cfg, 'search');
          last = placeholder.lastIndex;  // check if ?&
        }
      }
    } else {
      this.sourcePath = pattern;
      this.sourceSearch = '';
    }
    compiled += quoteRegExp(segment) + (config.strict === false ? '/?' : '') + '$';
    segments.push(segment);
    this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
    this.prefix = segments[0];
    this.$$paramNames = paramNames;
  }
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#concat
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns a new matcher for a pattern constructed by appending the path part and adding the
 * search parameters of the specified pattern to this pattern. The current pattern is not
 * modified. This can be understood as creating a pattern for URLs that are relative to (or
 * suffixes of) the current pattern.
 *
 * @example
 * The following two matchers are equivalent:
 * <pre>
 * new UrlMatcher('/user/{id}?q').concat('/details?date');
 * new UrlMatcher('/user/{id}/details?q&date');
 * </pre>
 *
 * @param {string} pattern  The pattern to append.
 * @param {Object} config  An object hash of the configuration for the matcher.
 * @returns {UrlMatcher}  A matcher for the concatenated pattern.
 */
  UrlMatcher.prototype.concat = function (pattern, config) {
    // Because order of search parameters is irrelevant, we can add our own search
    // parameters to the end of the new pattern. Parse the new pattern by itself
    // and then join the bits together, but it's much easier to do this on a string level.
    var defaultConfig = {
        caseInsensitive: $$UMFP.caseInsensitive(),
        strict: $$UMFP.strictMode(),
        squash: $$UMFP.defaultSquashPolicy()
      };
    return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
  };
  UrlMatcher.prototype.toString = function () {
    return this.source;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#exec
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Tests the specified path against this matcher, and returns an object containing the captured
 * parameter values, or null if the path does not match. The returned object contains the values
 * of any search parameters that are mentioned in the pattern, but their value may be null if
 * they are not present in `searchParams`. This means that search parameters are always treated
 * as optional.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', {
 *   x: '1', q: 'hello'
 * });
 * // returns { id: 'bob', q: 'hello', r: null }
 * </pre>
 *
 * @param {string} path  The URL path to match, e.g. `$location.path()`.
 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
 * @returns {Object}  The captured parameter values.
 */
  UrlMatcher.prototype.exec = function (path, searchParams) {
    var m = this.regexp.exec(path);
    if (!m)
      return null;
    searchParams = searchParams || {};
    var paramNames = this.parameters(), nTotal = paramNames.length, nPath = this.segments.length - 1, values = {}, i, j, cfg, paramName;
    if (nPath !== m.length - 1)
      throw new Error('Unbalanced capture group in route \'' + this.source + '\'');
    function decodePathArray(string) {
      function reverseString(str) {
        return str.split('').reverse().join('');
      }
      function unquoteDashes(str) {
        return str.replace(/\\-/, '-');
      }
      var split = reverseString(string).split(/-(?!\\)/);
      var allReversed = map(split, reverseString);
      return map(allReversed, unquoteDashes).reverse();
    }
    for (i = 0; i < nPath; i++) {
      paramName = paramNames[i];
      var param = this.params[paramName];
      var paramVal = m[i + 1];
      // if the param value matches a pre-replace pair, replace the value before decoding.
      for (j = 0; j < param.replace; j++) {
        if (param.replace[j].from === paramVal)
          paramVal = param.replace[j].to;
      }
      if (paramVal && param.array === true)
        paramVal = decodePathArray(paramVal);
      values[paramName] = param.value(paramVal);
    }
    for (; i < nTotal; i++) {
      paramName = paramNames[i];
      values[paramName] = this.params[paramName].value(searchParams[paramName]);
    }
    return values;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#parameters
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns the names of all path and search parameters of this pattern in an unspecified order.
 * 
 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
 *    pattern has no parameters, an empty array is returned.
 */
  UrlMatcher.prototype.parameters = function (param) {
    if (!isDefined(param))
      return this.$$paramNames;
    return this.params[param] || null;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#validate
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Checks an object hash of parameters to validate their correctness according to the parameter
 * types of this `UrlMatcher`.
 *
 * @param {Object} params The object hash of parameters to validate.
 * @returns {boolean} Returns `true` if `params` validates, otherwise `false`.
 */
  UrlMatcher.prototype.validates = function (params) {
    return this.params.$$validates(params);
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#format
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Creates a URL that matches this pattern by substituting the specified values
 * for the path and search parameters. Null values for path parameters are
 * treated as empty strings.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
 * // returns '/user/bob?q=yes'
 * </pre>
 *
 * @param {Object} values  the values to substitute for the parameters in this pattern.
 * @returns {string}  the formatted URL (path and optionally search part).
 */
  UrlMatcher.prototype.format = function (values) {
    values = values || {};
    var segments = this.segments, params = this.parameters(), paramset = this.params;
    if (!this.validates(values))
      return null;
    var i, search = false, nPath = segments.length - 1, nTotal = params.length, result = segments[0];
    function encodeDashes(str) {
      // Replace dashes with encoded "\-"
      return encodeURIComponent(str).replace(/-/g, function (c) {
        return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    for (i = 0; i < nTotal; i++) {
      var isPathParam = i < nPath;
      var name = params[i], param = paramset[name], value = param.value(values[name]);
      var isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
      var squash = isDefaultValue ? param.squash : false;
      var encoded = param.type.encode(value);
      if (isPathParam) {
        var nextSegment = segments[i + 1];
        if (squash === false) {
          if (encoded != null) {
            if (isArray(encoded)) {
              result += map(encoded, encodeDashes).join('-');
            } else {
              result += encodeURIComponent(encoded);
            }
          }
          result += nextSegment;
        } else if (squash === true) {
          var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
          result += nextSegment.match(capture)[1];
        } else if (isString(squash)) {
          result += squash + nextSegment;
        }
      } else {
        if (encoded == null || isDefaultValue && squash !== false)
          continue;
        if (!isArray(encoded))
          encoded = [encoded];
        encoded = map(encoded, encodeURIComponent).join('&' + name + '=');
        result += (search ? '&' : '?') + (name + '=' + encoded);
        search = true;
      }
    }
    return result;
  };
  /**
 * @ngdoc object
 * @name ui.router.util.type:Type
 *
 * @description
 * Implements an interface to define custom parameter types that can be decoded from and encoded to
 * string parameters matched in a URL. Used by {@link ui.router.util.type:UrlMatcher `UrlMatcher`}
 * objects when matching or formatting URLs, or comparing or validating parameter values.
 *
 * See {@link ui.router.util.$urlMatcherFactory#methods_type `$urlMatcherFactory#type()`} for more
 * information on registering custom types.
 *
 * @param {Object} config  A configuration object which contains the custom type definition.  The object's
 *        properties will override the default methods and/or pattern in `Type`'s public interface.
 * @example
 * <pre>
 * {
 *   decode: function(val) { return parseInt(val, 10); },
 *   encode: function(val) { return val && val.toString(); },
 *   equals: function(a, b) { return this.is(a) && a === b; },
 *   is: function(val) { return angular.isNumber(val) isFinite(val) && val % 1 === 0; },
 *   pattern: /\d+/
 * }
 * </pre>
 *
 * @property {RegExp} pattern The regular expression pattern used to match values of this type when
 *           coming from a substring of a URL.
 *
 * @returns {Object}  Returns a new `Type` object.
 */
  function Type(config) {
    extend(this, config);
  }
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#is
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Detects whether a value is of a particular type. Accepts a native (decoded) value
 * and determines whether it matches the current `Type` object.
 *
 * @param {*} val  The value to check.
 * @param {string} key  Optional. If the type check is happening in the context of a specific
 *        {@link ui.router.util.type:UrlMatcher `UrlMatcher`} object, this is the name of the
 *        parameter in which `val` is stored. Can be used for meta-programming of `Type` objects.
 * @returns {Boolean}  Returns `true` if the value matches the type, otherwise `false`.
 */
  Type.prototype.is = function (val, key) {
    return true;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#encode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Encodes a custom/native type value to a string that can be embedded in a URL. Note that the
 * return value does *not* need to be URL-safe (i.e. passed through `encodeURIComponent()`), it
 * only needs to be a representation of `val` that has been coerced to a string.
 *
 * @param {*} val  The value to encode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {string}  Returns a string representation of `val` that can be encoded in a URL.
 */
  Type.prototype.encode = function (val, key) {
    return val;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#decode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Converts a parameter value (from URL string or transition param) to a custom/native value.
 *
 * @param {string} val  The URL parameter value to decode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {*}  Returns a custom representation of the URL parameter value.
 */
  Type.prototype.decode = function (val, key) {
    return val;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#equals
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Determines whether two decoded values are equivalent.
 *
 * @param {*} a  A value to compare against.
 * @param {*} b  A value to compare against.
 * @returns {Boolean}  Returns `true` if the values are equivalent/equal, otherwise `false`.
 */
  Type.prototype.equals = function (a, b) {
    return a == b;
  };
  Type.prototype.$subPattern = function () {
    var sub = this.pattern.toString();
    return sub.substr(1, sub.length - 2);
  };
  Type.prototype.pattern = /.*/;
  Type.prototype.toString = function () {
    return '{Type:' + this.name + '}';
  };
  /*
 * Wraps an existing custom Type as an array of Type, depending on 'mode'.
 * e.g.:
 * - urlmatcher pattern "/path?{queryParam[]:int}"
 * - url: "/path?queryParam=1&queryParam=2
 * - $stateParams.queryParam will be [1, 2]
 * if `mode` is "auto", then
 * - url: "/path?queryParam=1 will create $stateParams.queryParam: 1
 * - url: "/path?queryParam=1&queryParam=2 will create $stateParams.queryParam: [1, 2]
 */
  Type.prototype.$asArray = function (mode, isSearch) {
    if (!mode)
      return this;
    if (mode === 'auto' && !isSearch)
      throw new Error('\'auto\' array mode is for query parameters only');
    return new ArrayType(this, mode);
    function ArrayType(type, mode) {
      function bindTo(type, callbackName) {
        return function () {
          return type[callbackName].apply(type, arguments);
        };
      }
      // Wrap non-array value as array
      function arrayWrap(val) {
        return isArray(val) ? val : isDefined(val) ? [val] : [];
      }
      // Unwrap array value for "auto" mode. Return undefined for empty array.
      function arrayUnwrap(val) {
        switch (val.length) {
        case 0:
          return undefined;
        case 1:
          return mode === 'auto' ? val[0] : val;
        default:
          return val;
        }
      }
      function falsey(val) {
        return !val;
      }
      // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
      function arrayHandler(callback, allTruthyMode) {
        return function handleArray(val) {
          val = arrayWrap(val);
          var result = map(val, callback);
          if (allTruthyMode === true)
            return filter(result, falsey).length === 0;
          return arrayUnwrap(result);
        };
      }
      // Wraps type (.equals) functions to operate on each value of an array
      function arrayEqualsHandler(callback) {
        return function handleArray(val1, val2) {
          var left = arrayWrap(val1), right = arrayWrap(val2);
          if (left.length !== right.length)
            return false;
          for (var i = 0; i < left.length; i++) {
            if (!callback(left[i], right[i]))
              return false;
          }
          return true;
        };
      }
      this.encode = arrayHandler(bindTo(type, 'encode'));
      this.decode = arrayHandler(bindTo(type, 'decode'));
      this.is = arrayHandler(bindTo(type, 'is'), true);
      this.equals = arrayEqualsHandler(bindTo(type, 'equals'));
      this.pattern = type.pattern;
      this.$arrayMode = mode;
    }
  };
  /**
 * @ngdoc object
 * @name ui.router.util.$urlMatcherFactory
 *
 * @description
 * Factory for {@link ui.router.util.type:UrlMatcher `UrlMatcher`} instances. The factory
 * is also available to providers under the name `$urlMatcherFactoryProvider`.
 */
  function $UrlMatcherFactory() {
    $$UMFP = this;
    var isCaseInsensitive = false, isStrictMode = true, defaultSquashPolicy = false;
    function valToString(val) {
      return val != null ? val.toString().replace(/\//g, '%2F') : val;
    }
    function valFromString(val) {
      return val != null ? val.toString().replace(/%2F/g, '/') : val;
    }
    //  TODO: in 1.0, make string .is() return false if value is undefined by default.
    //  function regexpMatches(val) { /*jshint validthis:true */ return isDefined(val) && this.pattern.test(val); }
    function regexpMatches(val) {
      /*jshint validthis:true */
      return this.pattern.test(val);
    }
    var $types = {}, enqueue = true, typeQueue = [], injector, defaultTypes = {
        string: {
          encode: valToString,
          decode: valFromString,
          is: regexpMatches,
          pattern: /[^/]*/
        },
        int: {
          encode: valToString,
          decode: function (val) {
            return parseInt(val, 10);
          },
          is: function (val) {
            return isDefined(val) && this.decode(val.toString()) === val;
          },
          pattern: /\d+/
        },
        bool: {
          encode: function (val) {
            return val ? 1 : 0;
          },
          decode: function (val) {
            return parseInt(val, 10) !== 0;
          },
          is: function (val) {
            return val === true || val === false;
          },
          pattern: /0|1/
        },
        date: {
          encode: function (val) {
            if (!this.is(val))
              return undefined;
            return [
              val.getFullYear(),
              ('0' + (val.getMonth() + 1)).slice(-2),
              ('0' + val.getDate()).slice(-2)
            ].join('-');
          },
          decode: function (val) {
            if (this.is(val))
              return val;
            var match = this.capture.exec(val);
            return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
          },
          is: function (val) {
            return val instanceof Date && !isNaN(val.valueOf());
          },
          equals: function (a, b) {
            return this.is(a) && this.is(b) && a.toISOString() === b.toISOString();
          },
          pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
          capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
        },
        json: {
          encode: angular.toJson,
          decode: angular.fromJson,
          is: angular.isObject,
          equals: angular.equals,
          pattern: /[^/]*/
        },
        any: {
          encode: angular.identity,
          decode: angular.identity,
          is: angular.identity,
          equals: angular.equals,
          pattern: /.*/
        }
      };
    function getDefaultConfig() {
      return {
        strict: isStrictMode,
        caseInsensitive: isCaseInsensitive
      };
    }
    function isInjectable(value) {
      return isFunction(value) || isArray(value) && isFunction(value[value.length - 1]);
    }
    /**
   * [Internal] Get the default value of a parameter, which may be an injectable function.
   */
    $UrlMatcherFactory.$$getDefaultValue = function (config) {
      if (!isInjectable(config.value))
        return config.value;
      if (!injector)
        throw new Error('Injectable functions cannot be called at configuration time');
      return injector.invoke(config.value);
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#caseInsensitive
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Defines whether URL matching should be case sensitive (the default behavior), or not.
   *
   * @param {boolean} value `false` to match URL in a case sensitive manner; otherwise `true`;
   * @returns {boolean} the current value of caseInsensitive
   */
    this.caseInsensitive = function (value) {
      if (isDefined(value))
        isCaseInsensitive = value;
      return isCaseInsensitive;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#strictMode
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Defines whether URLs should match trailing slashes, or not (the default behavior).
   *
   * @param {boolean=} value `false` to match trailing slashes in URLs, otherwise `true`.
   * @returns {boolean} the current value of strictMode
   */
    this.strictMode = function (value) {
      if (isDefined(value))
        isStrictMode = value;
      return isStrictMode;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#defaultSquashPolicy
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Sets the default behavior when generating or matching URLs with default parameter values.
   *
   * @param {string} value A string that defines the default parameter URL squashing behavior.
   *    `nosquash`: When generating an href with a default parameter value, do not squash the parameter value from the URL
   *    `slash`: When generating an href with a default parameter value, squash (remove) the parameter value, and, if the
   *             parameter is surrounded by slashes, squash (remove) one slash from the URL
   *    any other string, e.g. "~": When generating an href with a default parameter value, squash (remove)
   *             the parameter value from the URL and replace it with this string.
   */
    this.defaultSquashPolicy = function (value) {
      if (!isDefined(value))
        return defaultSquashPolicy;
      if (value !== true && value !== false && !isString(value))
        throw new Error('Invalid squash policy: ' + value + '. Valid policies: false, true, arbitrary-string');
      defaultSquashPolicy = value;
      return value;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#compile
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Creates a {@link ui.router.util.type:UrlMatcher `UrlMatcher`} for the specified pattern.
   *
   * @param {string} pattern  The URL pattern.
   * @param {Object} config  The config object hash.
   * @returns {UrlMatcher}  The UrlMatcher.
   */
    this.compile = function (pattern, config) {
      return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#isMatcher
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Returns true if the specified object is a `UrlMatcher`, or false otherwise.
   *
   * @param {Object} object  The object to perform the type check against.
   * @returns {Boolean}  Returns `true` if the object matches the `UrlMatcher` interface, by
   *          implementing all the same methods.
   */
    this.isMatcher = function (o) {
      if (!isObject(o))
        return false;
      var result = true;
      forEach(UrlMatcher.prototype, function (val, name) {
        if (isFunction(val)) {
          result = result && (isDefined(o[name]) && isFunction(o[name]));
        }
      });
      return result;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#type
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Registers a custom {@link ui.router.util.type:Type `Type`} object that can be used to
   * generate URLs with typed parameters.
   *
   * @param {string} name  The type name.
   * @param {Object|Function} definition   The type definition. See
   *        {@link ui.router.util.type:Type `Type`} for information on the values accepted.
   * @param {Object|Function} definitionFn (optional) A function that is injected before the app
   *        runtime starts.  The result of this function is merged into the existing `definition`.
   *        See {@link ui.router.util.type:Type `Type`} for information on the values accepted.
   *
   * @returns {Object}  Returns `$urlMatcherFactoryProvider`.
   *
   * @example
   * This is a simple example of a custom type that encodes and decodes items from an
   * array, using the array index as the URL-encoded value:
   *
   * <pre>
   * var list = ['John', 'Paul', 'George', 'Ringo'];
   *
   * $urlMatcherFactoryProvider.type('listItem', {
   *   encode: function(item) {
   *     // Represent the list item in the URL using its corresponding index
   *     return list.indexOf(item);
   *   },
   *   decode: function(item) {
   *     // Look up the list item by index
   *     return list[parseInt(item, 10)];
   *   },
   *   is: function(item) {
   *     // Ensure the item is valid by checking to see that it appears
   *     // in the list
   *     return list.indexOf(item) > -1;
   *   }
   * });
   *
   * $stateProvider.state('list', {
   *   url: "/list/{item:listItem}",
   *   controller: function($scope, $stateParams) {
   *     console.log($stateParams.item);
   *   }
   * });
   *
   * // ...
   *
   * // Changes URL to '/list/3', logs "Ringo" to the console
   * $state.go('list', { item: "Ringo" });
   * </pre>
   *
   * This is a more complex example of a type that relies on dependency injection to
   * interact with services, and uses the parameter name from the URL to infer how to
   * handle encoding and decoding parameter values:
   *
   * <pre>
   * // Defines a custom type that gets a value from a service,
   * // where each service gets different types of values from
   * // a backend API:
   * $urlMatcherFactoryProvider.type('dbObject', {}, function(Users, Posts) {
   *
   *   // Matches up services to URL parameter names
   *   var services = {
   *     user: Users,
   *     post: Posts
   *   };
   *
   *   return {
   *     encode: function(object) {
   *       // Represent the object in the URL using its unique ID
   *       return object.id;
   *     },
   *     decode: function(value, key) {
   *       // Look up the object by ID, using the parameter
   *       // name (key) to call the correct service
   *       return services[key].findById(value);
   *     },
   *     is: function(object, key) {
   *       // Check that object is a valid dbObject
   *       return angular.isObject(object) && object.id && services[key];
   *     }
   *     equals: function(a, b) {
   *       // Check the equality of decoded objects by comparing
   *       // their unique IDs
   *       return a.id === b.id;
   *     }
   *   };
   * });
   *
   * // In a config() block, you can then attach URLs with
   * // type-annotated parameters:
   * $stateProvider.state('users', {
   *   url: "/users",
   *   // ...
   * }).state('users.item', {
   *   url: "/{user:dbObject}",
   *   controller: function($scope, $stateParams) {
   *     // $stateParams.user will now be an object returned from
   *     // the Users service
   *   },
   *   // ...
   * });
   * </pre>
   */
    this.type = function (name, definition, definitionFn) {
      if (!isDefined(definition))
        return $types[name];
      if ($types.hasOwnProperty(name))
        throw new Error('A type named \'' + name + '\' has already been defined.');
      $types[name] = new Type(extend({ name: name }, definition));
      if (definitionFn) {
        typeQueue.push({
          name: name,
          def: definitionFn
        });
        if (!enqueue)
          flushTypeQueue();
      }
      return this;
    };
    // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
    function flushTypeQueue() {
      while (typeQueue.length) {
        var type = typeQueue.shift();
        if (type.pattern)
          throw new Error('You cannot override a type\'s .pattern at runtime.');
        angular.extend($types[type.name], injector.invoke(type.def));
      }
    }
    // Register default types. Store them in the prototype of $types.
    forEach(defaultTypes, function (type, name) {
      $types[name] = new Type(extend({ name: name }, type));
    });
    $types = inherit($types, {});
    /* No need to document $get, since it returns this */
    this.$get = [
      '$injector',
      function ($injector) {
        injector = $injector;
        enqueue = false;
        flushTypeQueue();
        forEach(defaultTypes, function (type, name) {
          if (!$types[name])
            $types[name] = new Type(type);
        });
        return this;
      }
    ];
    this.Param = function Param(id, type, config, location) {
      var self = this;
      config = unwrapShorthand(config);
      type = getType(config, type, location);
      var arrayMode = getArrayMode();
      type = arrayMode ? type.$asArray(arrayMode, location === 'search') : type;
      if (type.name === 'string' && !arrayMode && location === 'path' && config.value === undefined)
        config.value = '';
      // for 0.2.x; in 0.3.0+ do not automatically default to ""
      var isOptional = config.value !== undefined;
      var squash = getSquashPolicy(config, isOptional);
      var replace = getReplace(config, arrayMode, isOptional, squash);
      function unwrapShorthand(config) {
        var keys = isObject(config) ? objectKeys(config) : [];
        var isShorthand = indexOf(keys, 'value') === -1 && indexOf(keys, 'type') === -1 && indexOf(keys, 'squash') === -1 && indexOf(keys, 'array') === -1;
        if (isShorthand)
          config = { value: config };
        config.$$fn = isInjectable(config.value) ? config.value : function () {
          return config.value;
        };
        return config;
      }
      function getType(config, urlType, location) {
        if (config.type && urlType)
          throw new Error('Param \'' + id + '\' has two type configurations.');
        if (urlType)
          return urlType;
        if (!config.type)
          return location === 'config' ? $types.any : $types.string;
        return config.type instanceof Type ? config.type : new Type(config.type);
      }
      // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
      function getArrayMode() {
        var arrayDefaults = { array: location === 'search' ? 'auto' : false };
        var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
        return extend(arrayDefaults, arrayParamNomenclature, config).array;
      }
      /**
     * returns false, true, or the squash value to indicate the "default parameter url squash policy".
     */
      function getSquashPolicy(config, isOptional) {
        var squash = config.squash;
        if (!isOptional || squash === false)
          return false;
        if (!isDefined(squash) || squash == null)
          return defaultSquashPolicy;
        if (squash === true || isString(squash))
          return squash;
        throw new Error('Invalid squash policy: \'' + squash + '\'. Valid policies: false, true, or arbitrary string');
      }
      function getReplace(config, arrayMode, isOptional, squash) {
        var replace, configuredKeys, defaultPolicy = [
            {
              from: '',
              to: isOptional || arrayMode ? undefined : ''
            },
            {
              from: null,
              to: isOptional || arrayMode ? undefined : ''
            }
          ];
        replace = isArray(config.replace) ? config.replace : [];
        if (isString(squash))
          replace.push({
            from: squash,
            to: undefined
          });
        configuredKeys = map(replace, function (item) {
          return item.from;
        });
        return filter(defaultPolicy, function (item) {
          return indexOf(configuredKeys, item.from) === -1;
        }).concat(replace);
      }
      /**
     * [Internal] Get the default value of a parameter, which may be an injectable function.
     */
      function $$getDefaultValue() {
        if (!injector)
          throw new Error('Injectable functions cannot be called at configuration time');
        return injector.invoke(config.$$fn);
      }
      /**
     * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
     * default value, which may be the result of an injectable function.
     */
      function $value(value) {
        function hasReplaceVal(val) {
          return function (obj) {
            return obj.from === val;
          };
        }
        function $replace(value) {
          var replacement = map(filter(self.replace, hasReplaceVal(value)), function (obj) {
              return obj.to;
            });
          return replacement.length ? replacement[0] : value;
        }
        value = $replace(value);
        return isDefined(value) ? self.type.decode(value) : $$getDefaultValue();
      }
      function toString() {
        return '{Param:' + id + ' ' + type + ' squash: \'' + squash + '\' optional: ' + isOptional + '}';
      }
      extend(this, {
        id: id,
        type: type,
        location: location,
        array: arrayMode,
        squash: squash,
        replace: replace,
        isOptional: isOptional,
        value: $value,
        dynamic: undefined,
        config: config,
        toString: toString
      });
    };
    function ParamSet(params) {
      extend(this, params || {});
    }
    ParamSet.prototype = {
      $$new: function () {
        return inherit(this, extend(new ParamSet(), { $$parent: this }));
      },
      $$keys: function () {
        var keys = [], chain = [], parent = this, ignore = objectKeys(ParamSet.prototype);
        while (parent) {
          chain.push(parent);
          parent = parent.$$parent;
        }
        chain.reverse();
        forEach(chain, function (paramset) {
          forEach(objectKeys(paramset), function (key) {
            if (indexOf(keys, key) === -1 && indexOf(ignore, key) === -1)
              keys.push(key);
          });
        });
        return keys;
      },
      $$values: function (paramValues) {
        var values = {}, self = this;
        forEach(self.$$keys(), function (key) {
          values[key] = self[key].value(paramValues && paramValues[key]);
        });
        return values;
      },
      $$equals: function (paramValues1, paramValues2) {
        var equal = true, self = this;
        forEach(self.$$keys(), function (key) {
          var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
          if (!self[key].type.equals(left, right))
            equal = false;
        });
        return equal;
      },
      $$validates: function $$validate(paramValues) {
        var result = true, isOptional, val, param, self = this;
        forEach(this.$$keys(), function (key) {
          param = self[key];
          val = paramValues[key];
          isOptional = !val && param.isOptional;
          result = result && (isOptional || !!param.type.is(val));
        });
        return result;
      },
      $$parent: undefined
    };
    this.ParamSet = ParamSet;
  }
  // Register as a provider so it's available to other providers
  angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
  angular.module('ui.router.util').run([
    '$urlMatcherFactory',
    function ($urlMatcherFactory) {
    }
  ]);
  /**
 * @ngdoc object
 * @name ui.router.router.$urlRouterProvider
 *
 * @requires ui.router.util.$urlMatcherFactoryProvider
 * @requires $locationProvider
 *
 * @description
 * `$urlRouterProvider` has the responsibility of watching `$location`. 
 * When `$location` changes it runs through a list of rules one by one until a 
 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify 
 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
 *
 * There are several methods on `$urlRouterProvider` that make it useful to use directly
 * in your module config.
 */
  $UrlRouterProvider.$inject = [
    '$locationProvider',
    '$urlMatcherFactoryProvider'
  ];
  function $UrlRouterProvider($locationProvider, $urlMatcherFactory) {
    var rules = [], otherwise = null, interceptDeferred = false, listener;
    // Returns a string that is a prefix of all strings matching the RegExp
    function regExpPrefix(re) {
      var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
      return prefix != null ? prefix[1].replace(/\\(.)/g, '$1') : '';
    }
    // Interpolates matched values into a String.replace()-style pattern
    function interpolate(pattern, match) {
      return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
        return match[what === '$' ? 0 : Number(what)];
      });
    }
    /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#rule
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines rules that are used by `$urlRouterProvider` to find matches for
   * specific URLs.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // Here's an example of how you might allow case insensitive urls
   *   $urlRouterProvider.rule(function ($injector, $location) {
   *     var path = $location.path(),
   *         normalized = path.toLowerCase();
   *
   *     if (path !== normalized) {
   *       return normalized;
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {object} rule Handler function that takes `$injector` and `$location`
   * services as arguments. You can use them to return a valid path as a string.
   *
   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
   */
    this.rule = function (rule) {
      if (!isFunction(rule))
        throw new Error('\'rule\' must be a function');
      rules.push(rule);
      return this;
    };
    /**
   * @ngdoc object
   * @name ui.router.router.$urlRouterProvider#otherwise
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines a path that is used when an invalid route is requested.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // if the path doesn't match any of the urls you configured
   *   // otherwise will take care of routing the user to the
   *   // specified url
   *   $urlRouterProvider.otherwise('/index');
   *
   *   // Example of using function rule as param
   *   $urlRouterProvider.otherwise(function ($injector, $location) {
   *     return '/a/valid/url';
   *   });
   * });
   * </pre>
   *
   * @param {string|object} rule The url path you want to redirect to or a function 
   * rule that returns the url path. The function version is passed two params: 
   * `$injector` and `$location` services, and must return a url string.
   *
   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
   */
    this.otherwise = function (rule) {
      if (isString(rule)) {
        var redirect = rule;
        rule = function () {
          return redirect;
        };
      } else if (!isFunction(rule))
        throw new Error('\'rule\' must be a function');
      otherwise = rule;
      return this;
    };
    function handleIfMatch($injector, handler, match) {
      if (!match)
        return false;
      var result = $injector.invoke(handler, handler, { $match: match });
      return isDefined(result) ? result : true;
    }
    /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#when
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Registers a handler for a given url matching. if handle is a string, it is
   * treated as a redirect, and is interpolated according to the syntax of match
   * (i.e. like `String.replace()` for `RegExp`, or like a `UrlMatcher` pattern otherwise).
   *
   * If the handler is a function, it is injectable. It gets invoked if `$location`
   * matches. You have the option of inject the match object as `$match`.
   *
   * The handler can return
   *
   * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
   *   will continue trying to find another one that matches.
   * - **string** which is treated as a redirect and passed to `$location.url()`
   * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
   *     if ($state.$current.navigable !== state ||
   *         !equalForKeys($match, $stateParams) {
   *      $state.transitionTo(state, $match, false);
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {string|object} what The incoming path that you want to redirect.
   * @param {string|object} handler The path you want to redirect your user to.
   */
    this.when = function (what, handler) {
      var redirect, handlerIsString = isString(handler);
      if (isString(what))
        what = $urlMatcherFactory.compile(what);
      if (!handlerIsString && !isFunction(handler) && !isArray(handler))
        throw new Error('invalid \'handler\' in when()');
      var strategies = {
          matcher: function (what, handler) {
            if (handlerIsString) {
              redirect = $urlMatcherFactory.compile(handler);
              handler = [
                '$match',
                function ($match) {
                  return redirect.format($match);
                }
              ];
            }
            return extend(function ($injector, $location) {
              return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
            }, { prefix: isString(what.prefix) ? what.prefix : '' });
          },
          regex: function (what, handler) {
            if (what.global || what.sticky)
              throw new Error('when() RegExp must not be global or sticky');
            if (handlerIsString) {
              redirect = handler;
              handler = [
                '$match',
                function ($match) {
                  return interpolate(redirect, $match);
                }
              ];
            }
            return extend(function ($injector, $location) {
              return handleIfMatch($injector, handler, what.exec($location.path()));
            }, { prefix: regExpPrefix(what) });
          }
        };
      var check = {
          matcher: $urlMatcherFactory.isMatcher(what),
          regex: what instanceof RegExp
        };
      for (var n in check) {
        if (check[n])
          return this.rule(strategies[n](what, handler));
      }
      throw new Error('invalid \'what\' in when()');
    };
    /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#deferIntercept
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Disables (or enables) deferring location change interception.
   *
   * If you wish to customize the behavior of syncing the URL (for example, if you wish to
   * defer a transition but maintain the current URL), call this method at configuration time.
   * Then, at run time, call `$urlRouter.listen()` after you have configured your own
   * `$locationChangeSuccess` event handler.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *
   *   // Prevent $urlRouter from automatically intercepting URL changes;
   *   // this allows you to configure custom behavior in between
   *   // location changes and route synchronization:
   *   $urlRouterProvider.deferIntercept();
   *
   * }).run(function ($rootScope, $urlRouter, UserService) {
   *
   *   $rootScope.$on('$locationChangeSuccess', function(e) {
   *     // UserService is an example service for managing user state
   *     if (UserService.isLoggedIn()) return;
   *
   *     // Prevent $urlRouter's default handler from firing
   *     e.preventDefault();
   *
   *     UserService.handleLogin().then(function() {
   *       // Once the user has logged in, sync the current URL
   *       // to the router:
   *       $urlRouter.sync();
   *     });
   *   });
   *
   *   // Configures $urlRouter's listener *after* your custom listener
   *   $urlRouter.listen();
   * });
   * </pre>
   *
   * @param {boolean} defer Indicates whether to defer location change interception. Passing
            no parameter is equivalent to `true`.
   */
    this.deferIntercept = function (defer) {
      if (defer === undefined)
        defer = true;
      interceptDeferred = defer;
    };
    /**
   * @ngdoc object
   * @name ui.router.router.$urlRouter
   *
   * @requires $location
   * @requires $rootScope
   * @requires $injector
   * @requires $browser
   *
   * @description
   *
   */
    this.$get = $get;
    $get.$inject = [
      '$location',
      '$rootScope',
      '$injector',
      '$browser'
    ];
    function $get($location, $rootScope, $injector, $browser) {
      var baseHref = $browser.baseHref(), location = $location.url(), lastPushedUrl;
      function appendBasePath(url, isHtml5, absolute) {
        if (baseHref === '/')
          return url;
        if (isHtml5)
          return baseHref.slice(0, -1) + url;
        if (absolute)
          return baseHref.slice(1) + url;
        return url;
      }
      // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
      function update(evt) {
        if (evt && evt.defaultPrevented)
          return;
        var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
        lastPushedUrl = undefined;
        if (ignoreUpdate)
          return true;
        function check(rule) {
          var handled = rule($injector, $location);
          if (!handled)
            return false;
          if (isString(handled))
            $location.replace().url(handled);
          return true;
        }
        var n = rules.length, i;
        for (i = 0; i < n; i++) {
          if (check(rules[i]))
            return;
        }
        // always check otherwise last to allow dynamic updates to the set of rules
        if (otherwise)
          check(otherwise);
      }
      function listen() {
        listener = listener || $rootScope.$on('$locationChangeSuccess', update);
        return listener;
      }
      if (!interceptDeferred)
        listen();
      return {
        sync: function () {
          update();
        },
        listen: function () {
          return listen();
        },
        update: function (read) {
          if (read) {
            location = $location.url();
            return;
          }
          if ($location.url() === location)
            return;
          $location.url(location);
          $location.replace();
        },
        push: function (urlMatcher, params, options) {
          $location.url(urlMatcher.format(params || {}));
          lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;
          if (options && options.replace)
            $location.replace();
        },
        href: function (urlMatcher, params, options) {
          if (!urlMatcher.validates(params))
            return null;
          var isHtml5 = $locationProvider.html5Mode();
          if (angular.isObject(isHtml5)) {
            isHtml5 = isHtml5.enabled;
          }
          var url = urlMatcher.format(params);
          options = options || {};
          if (!isHtml5 && url !== null) {
            url = '#' + $locationProvider.hashPrefix() + url;
          }
          url = appendBasePath(url, isHtml5, options.absolute);
          if (!options.absolute || !url) {
            return url;
          }
          var slash = !isHtml5 && url ? '/' : '', port = $location.port();
          port = port === 80 || port === 443 ? '' : ':' + port;
          return [
            $location.protocol(),
            '://',
            $location.host(),
            port,
            slash,
            url
          ].join('');
        }
      };
    }
  }
  angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);
  /**
 * @ngdoc object
 * @name ui.router.state.$stateProvider
 *
 * @requires ui.router.router.$urlRouterProvider
 * @requires ui.router.util.$urlMatcherFactoryProvider
 *
 * @description
 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
 * on state.
 *
 * A state corresponds to a "place" in the application in terms of the overall UI and
 * navigation. A state describes (via the controller / template / view properties) what
 * the UI looks like and does at that place.
 *
 * States often have things in common, and the primary way of factoring out these
 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
 * nested states.
 *
 * The `$stateProvider` provides interfaces to declare these states for your app.
 */
  $StateProvider.$inject = [
    '$urlRouterProvider',
    '$urlMatcherFactoryProvider'
  ];
  function $StateProvider($urlRouterProvider, $urlMatcherFactory) {
    var root, states = {}, $state, queue = {}, abstractKey = 'abstract';
    // Builds state properties from definition passed to registerState()
    var stateBuilder = {
        parent: function (state) {
          if (isDefined(state.parent) && state.parent)
            return findState(state.parent);
          // regex matches any valid composite state name
          // would match "contact.list" but not "contacts"
          var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
          return compositeName ? findState(compositeName[1]) : root;
        },
        data: function (state) {
          if (state.parent && state.parent.data) {
            state.data = state.self.data = extend({}, state.parent.data, state.data);
          }
          return state.data;
        },
        url: function (state) {
          var url = state.url, config = { params: state.params || {} };
          if (isString(url)) {
            if (url.charAt(0) == '^')
              return $urlMatcherFactory.compile(url.substring(1), config);
            return (state.parent.navigable || root).url.concat(url, config);
          }
          if (!url || $urlMatcherFactory.isMatcher(url))
            return url;
          throw new Error('Invalid url \'' + url + '\' in state \'' + state + '\'');
        },
        navigable: function (state) {
          return state.url ? state : state.parent ? state.parent.navigable : null;
        },
        ownParams: function (state) {
          var params = state.url && state.url.params || new $$UMFP.ParamSet();
          forEach(state.params || {}, function (config, id) {
            if (!params[id])
              params[id] = new $$UMFP.Param(id, null, config, 'config');
          });
          return params;
        },
        params: function (state) {
          return state.parent && state.parent.params ? extend(state.parent.params.$$new(), state.ownParams) : new $$UMFP.ParamSet();
        },
        views: function (state) {
          var views = {};
          forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
            if (name.indexOf('@') < 0)
              name += '@' + state.parent.name;
            views[name] = view;
          });
          return views;
        },
        path: function (state) {
          return state.parent ? state.parent.path.concat(state) : [];  // exclude root from path
        },
        includes: function (state) {
          var includes = state.parent ? extend({}, state.parent.includes) : {};
          includes[state.name] = true;
          return includes;
        },
        $delegates: {}
      };
    function isRelative(stateName) {
      return stateName.indexOf('.') === 0 || stateName.indexOf('^') === 0;
    }
    function findState(stateOrName, base) {
      if (!stateOrName)
        return undefined;
      var isStr = isString(stateOrName), name = isStr ? stateOrName : stateOrName.name, path = isRelative(name);
      if (path) {
        if (!base)
          throw new Error('No reference point given for path \'' + name + '\'');
        base = findState(base);
        var rel = name.split('.'), i = 0, pathLength = rel.length, current = base;
        for (; i < pathLength; i++) {
          if (rel[i] === '' && i === 0) {
            current = base;
            continue;
          }
          if (rel[i] === '^') {
            if (!current.parent)
              throw new Error('Path \'' + name + '\' not valid for state \'' + base.name + '\'');
            current = current.parent;
            continue;
          }
          break;
        }
        rel = rel.slice(i).join('.');
        name = current.name + (current.name && rel ? '.' : '') + rel;
      }
      var state = states[name];
      if (state && (isStr || !isStr && (state === stateOrName || state.self === stateOrName))) {
        return state;
      }
      return undefined;
    }
    function queueState(parentName, state) {
      if (!queue[parentName]) {
        queue[parentName] = [];
      }
      queue[parentName].push(state);
    }
    function flushQueuedChildren(parentName) {
      var queued = queue[parentName] || [];
      while (queued.length) {
        registerState(queued.shift());
      }
    }
    function registerState(state) {
      // Wrap a new object around the state so we can store our private details easily.
      state = inherit(state, {
        self: state,
        resolve: state.resolve || {},
        toString: function () {
          return this.name;
        }
      });
      var name = state.name;
      if (!isString(name) || name.indexOf('@') >= 0)
        throw new Error('State must have a valid name');
      if (states.hasOwnProperty(name))
        throw new Error('State \'' + name + '\'\' is already defined');
      // Get parent name
      var parentName = name.indexOf('.') !== -1 ? name.substring(0, name.lastIndexOf('.')) : isString(state.parent) ? state.parent : isObject(state.parent) && isString(state.parent.name) ? state.parent.name : '';
      // If parent is not registered yet, add state to queue and register later
      if (parentName && !states[parentName]) {
        return queueState(parentName, state.self);
      }
      for (var key in stateBuilder) {
        if (isFunction(stateBuilder[key]))
          state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
      }
      states[name] = state;
      // Register the state in the global state list and with $urlRouter if necessary.
      if (!state[abstractKey] && state.url) {
        $urlRouterProvider.when(state.url, [
          '$match',
          '$stateParams',
          function ($match, $stateParams) {
            if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
              $state.transitionTo(state, $match, {
                inherit: true,
                location: false
              });
            }
          }
        ]);
      }
      // Register any queued children
      flushQueuedChildren(name);
      return state;
    }
    // Checks text to see if it looks like a glob.
    function isGlob(text) {
      return text.indexOf('*') > -1;
    }
    // Returns true if glob matches current $state name.
    function doesStateMatchGlob(glob) {
      var globSegments = glob.split('.'), segments = $state.$current.name.split('.');
      //match greedy starts
      if (globSegments[0] === '**') {
        segments = segments.slice(indexOf(segments, globSegments[1]));
        segments.unshift('**');
      }
      //match greedy ends
      if (globSegments[globSegments.length - 1] === '**') {
        segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
        segments.push('**');
      }
      if (globSegments.length != segments.length) {
        return false;
      }
      //match single stars
      for (var i = 0, l = globSegments.length; i < l; i++) {
        if (globSegments[i] === '*') {
          segments[i] = '*';
        }
      }
      return segments.join('') === globSegments.join('');
    }
    // Implicit root state that is always active
    root = registerState({
      name: '',
      url: '^',
      views: null,
      'abstract': true
    });
    root.navigable = null;
    /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#decorator
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Allows you to extend (carefully) or override (at your own peril) the 
   * `stateBuilder` object used internally by `$stateProvider`. This can be used 
   * to add custom functionality to ui-router, for example inferring templateUrl 
   * based on the state name.
   *
   * When passing only a name, it returns the current (original or decorated) builder
   * function that matches `name`.
   *
   * The builder functions that can be decorated are listed below. Though not all
   * necessarily have a good use case for decoration, that is up to you to decide.
   *
   * In addition, users can attach custom decorators, which will generate new 
   * properties within the state's internal definition. There is currently no clear 
   * use-case for this beyond accessing internal states (i.e. $state.$current), 
   * however, expect this to become increasingly relevant as we introduce additional 
   * meta-programming features.
   *
   * **Warning**: Decorators should not be interdependent because the order of 
   * execution of the builder functions in non-deterministic. Builder functions 
   * should only be dependent on the state definition object and super function.
   *
   *
   * Existing builder functions and current return values:
   *
   * - **parent** `{object}` - returns the parent state object.
   * - **data** `{object}` - returns state data, including any inherited data that is not
   *   overridden by own values (if any).
   * - **url** `{object}` - returns a {@link ui.router.util.type:UrlMatcher UrlMatcher}
   *   or `null`.
   * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is 
   *   navigable).
   * - **params** `{object}` - returns an array of state params that are ensured to 
   *   be a super-set of parent's params.
   * - **views** `{object}` - returns a views object where each key is an absolute view 
   *   name (i.e. "viewName@stateName") and each value is the config object 
   *   (template, controller) for the view. Even when you don't use the views object 
   *   explicitly on a state config, one is still created for you internally.
   *   So by decorating this builder function you have access to decorating template 
   *   and controller properties.
   * - **ownParams** `{object}` - returns an array of params that belong to the state, 
   *   not including any params defined by ancestor states.
   * - **path** `{string}` - returns the full path from the root down to this state. 
   *   Needed for state activation.
   * - **includes** `{object}` - returns an object that includes every state that 
   *   would pass a `$state.includes()` test.
   *
   * @example
   * <pre>
   * // Override the internal 'views' builder with a function that takes the state
   * // definition, and a reference to the internal function being overridden:
   * $stateProvider.decorator('views', function (state, parent) {
   *   var result = {},
   *       views = parent(state);
   *
   *   angular.forEach(views, function (config, name) {
   *     var autoName = (state.name + '.' + name).replace('.', '/');
   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
   *     result[name] = config;
   *   });
   *   return result;
   * });
   *
   * $stateProvider.state('home', {
   *   views: {
   *     'contact.list': { controller: 'ListController' },
   *     'contact.item': { controller: 'ItemController' }
   *   }
   * });
   *
   * // ...
   *
   * $state.go('home');
   * // Auto-populates list and item views with /partials/home/contact/list.html,
   * // and /partials/home/contact/item.html, respectively.
   * </pre>
   *
   * @param {string} name The name of the builder function to decorate. 
   * @param {object} func A function that is responsible for decorating the original 
   * builder function. The function receives two parameters:
   *
   *   - `{object}` - state - The state config object.
   *   - `{object}` - super - The original builder function.
   *
   * @return {object} $stateProvider - $stateProvider instance
   */
    this.decorator = decorator;
    function decorator(name, func) {
      /*jshint validthis: true */
      if (isString(name) && !isDefined(func)) {
        return stateBuilder[name];
      }
      if (!isFunction(func) || !isString(name)) {
        return this;
      }
      if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
        stateBuilder.$delegates[name] = stateBuilder[name];
      }
      stateBuilder[name] = func;
      return this;
    }
    /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#state
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Registers a state configuration under a given state name. The stateConfig object
   * has the following acceptable properties.
   *
   * @param {string} name A unique state name, e.g. "home", "about", "contacts".
   * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
   * @param {object} stateConfig State configuration object.
   * @param {string|function=} stateConfig.template
   * <a id='template'></a>
   *   html template as a string or a function that returns
   *   an html template as a string which should be used by the uiView directives. This property 
   *   takes precedence over templateUrl.
   *   
   *   If `template` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
   *     applying the current state
   *
   * <pre>template:
   *   "<h1>inline template definition</h1>" +
   *   "<div ui-view></div>"</pre>
   * <pre>template: function(params) {
   *       return "<h1>generated template</h1>"; }</pre>
   * </div>
   *
   * @param {string|function=} stateConfig.templateUrl
   * <a id='templateUrl'></a>
   *
   *   path or function that returns a path to an html
   *   template that should be used by uiView.
   *   
   *   If `templateUrl` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by 
   *     applying the current state
   *
   * <pre>templateUrl: "home.html"</pre>
   * <pre>templateUrl: function(params) {
   *     return myTemplates[params.pageId]; }</pre>
   *
   * @param {function=} stateConfig.templateProvider
   * <a id='templateProvider'></a>
   *    Provider function that returns HTML content string.
   * <pre> templateProvider:
   *       function(MyTemplateService, params) {
   *         return MyTemplateService.getTemplate(params.pageId);
   *       }</pre>
   *
   * @param {string|function=} stateConfig.controller
   * <a id='controller'></a>
   *
   *  Controller fn that should be associated with newly
   *   related scope or the name of a registered controller if passed as a string.
   *   Optionally, the ControllerAs may be declared here.
   * <pre>controller: "MyRegisteredController"</pre>
   * <pre>controller:
   *     "MyRegisteredController as fooCtrl"}</pre>
   * <pre>controller: function($scope, MyService) {
   *     $scope.data = MyService.getData(); }</pre>
   *
   * @param {function=} stateConfig.controllerProvider
   * <a id='controllerProvider'></a>
   *
   * Injectable provider function that returns the actual controller or string.
   * <pre>controllerProvider:
   *   function(MyResolveData) {
   *     if (MyResolveData.foo)
   *       return "FooCtrl"
   *     else if (MyResolveData.bar)
   *       return "BarCtrl";
   *     else return function($scope) {
   *       $scope.baz = "Qux";
   *     }
   *   }</pre>
   *
   * @param {string=} stateConfig.controllerAs
   * <a id='controllerAs'></a>
   * 
   * A controller alias name. If present the controller will be
   *   published to scope under the controllerAs name.
   * <pre>controllerAs: "myCtrl"</pre>
   *
   * @param {object=} stateConfig.resolve
   * <a id='resolve'></a>
   *
   * An optional map&lt;string, function&gt; of dependencies which
   *   should be injected into the controller. If any of these dependencies are promises, 
   *   the router will wait for them all to be resolved before the controller is instantiated.
   *   If all the promises are resolved successfully, the $stateChangeSuccess event is fired
   *   and the values of the resolved promises are injected into any controllers that reference them.
   *   If any  of the promises are rejected the $stateChangeError event is fired.
   *
   *   The map object is:
   *   
   *   - key - {string}: name of dependency to be injected into controller
   *   - factory - {string|function}: If string then it is alias for service. Otherwise if function, 
   *     it is injected and return value it treated as dependency. If result is a promise, it is 
   *     resolved before its value is injected into controller.
   *
   * <pre>resolve: {
   *     myResolve1:
   *       function($http, $stateParams) {
   *         return $http.get("/api/foos/"+stateParams.fooID);
   *       }
   *     }</pre>
   *
   * @param {string=} stateConfig.url
   * <a id='url'></a>
   *
   *   A url fragment with optional parameters. When a state is navigated or
   *   transitioned to, the `$stateParams` service will be populated with any 
   *   parameters that were passed.
   *
   * examples:
   * <pre>url: "/home"
   * url: "/users/:userid"
   * url: "/books/{bookid:[a-zA-Z_-]}"
   * url: "/books/{categoryid:int}"
   * url: "/books/{publishername:string}/{categoryid:int}"
   * url: "/messages?before&after"
   * url: "/messages?{before:date}&{after:date}"</pre>
   * url: "/messages/:mailboxid?{before:date}&{after:date}"
   *
   * @param {object=} stateConfig.views
   * <a id='views'></a>
   * an optional map&lt;string, object&gt; which defined multiple views, or targets views
   * manually/explicitly.
   *
   * Examples:
   *
   * Targets three named `ui-view`s in the parent state's template
   * <pre>views: {
   *     header: {
   *       controller: "headerCtrl",
   *       templateUrl: "header.html"
   *     }, body: {
   *       controller: "bodyCtrl",
   *       templateUrl: "body.html"
   *     }, footer: {
   *       controller: "footCtrl",
   *       templateUrl: "footer.html"
   *     }
   *   }</pre>
   *
   * Targets named `ui-view="header"` from grandparent state 'top''s template, and named `ui-view="body" from parent state's template.
   * <pre>views: {
   *     'header@top': {
   *       controller: "msgHeaderCtrl",
   *       templateUrl: "msgHeader.html"
   *     }, 'body': {
   *       controller: "messagesCtrl",
   *       templateUrl: "messages.html"
   *     }
   *   }</pre>
   *
   * @param {boolean=} [stateConfig.abstract=false]
   * <a id='abstract'></a>
   * An abstract state will never be directly activated,
   *   but can provide inherited properties to its common children states.
   * <pre>abstract: true</pre>
   *
   * @param {function=} stateConfig.onEnter
   * <a id='onEnter'></a>
   *
   * Callback function for when a state is entered. Good way
   *   to trigger an action or dispatch an event, such as opening a dialog.
   * If minifying your scripts, make sure to explictly annotate this function,
   * because it won't be automatically annotated by your build tools.
   *
   * <pre>onEnter: function(MyService, $stateParams) {
   *     MyService.foo($stateParams.myParam);
   * }</pre>
   *
   * @param {function=} stateConfig.onExit
   * <a id='onExit'></a>
   *
   * Callback function for when a state is exited. Good way to
   *   trigger an action or dispatch an event, such as opening a dialog.
   * If minifying your scripts, make sure to explictly annotate this function,
   * because it won't be automatically annotated by your build tools.
   *
   * <pre>onExit: function(MyService, $stateParams) {
   *     MyService.cleanup($stateParams.myParam);
   * }</pre>
   *
   * @param {boolean=} [stateConfig.reloadOnSearch=true]
   * <a id='reloadOnSearch'></a>
   *
   * If `false`, will not retrigger the same state
   *   just because a search/query parameter has changed (via $location.search() or $location.hash()). 
   *   Useful for when you'd like to modify $location.search() without triggering a reload.
   * <pre>reloadOnSearch: false</pre>
   *
   * @param {object=} stateConfig.data
   * <a id='data'></a>
   *
   * Arbitrary data object, useful for custom configuration.  The parent state's `data` is
   *   prototypally inherited.  In other words, adding a data property to a state adds it to
   *   the entire subtree via prototypal inheritance.
   *
   * <pre>data: {
   *     requiredRole: 'foo'
   * } </pre>
   *
   * @param {object=} stateConfig.params
   * <a id='params'></a>
   *
   * A map which optionally configures parameters declared in the `url`, or
   *   defines additional non-url parameters.  For each parameter being
   *   configured, add a configuration object keyed to the name of the parameter.
   *
   *   Each parameter configuration object may contain the following properties:
   *
   *   - ** value ** - {object|function=}: specifies the default value for this
   *     parameter.  This implicitly sets this parameter as optional.
   *
   *     When UI-Router routes to a state and no value is
   *     specified for this parameter in the URL or transition, the
   *     default value will be used instead.  If `value` is a function,
   *     it will be injected and invoked, and the return value used.
   *
   *     *Note*: `undefined` is treated as "no default value" while `null`
   *     is treated as "the default value is `null`".
   *
   *     *Shorthand*: If you only need to configure the default value of the
   *     parameter, you may use a shorthand syntax.   In the **`params`**
   *     map, instead mapping the param name to a full parameter configuration
   *     object, simply set map it to the default parameter value, e.g.:
   *
   * <pre>// define a parameter's default value
   * params: {
   *     param1: { value: "defaultValue" }
   * }
   * // shorthand default values
   * params: {
   *     param1: "defaultValue",
   *     param2: "param2Default"
   * }</pre>
   *
   *   - ** array ** - {boolean=}: *(default: false)* If true, the param value will be
   *     treated as an array of values.  If you specified a Type, the value will be
   *     treated as an array of the specified Type.  Note: query parameter values
   *     default to a special `"auto"` mode.
   *
   *     For query parameters in `"auto"` mode, if multiple  values for a single parameter
   *     are present in the URL (e.g.: `/foo?bar=1&bar=2&bar=3`) then the values
   *     are mapped to an array (e.g.: `{ foo: [ '1', '2', '3' ] }`).  However, if
   *     only one value is present (e.g.: `/foo?bar=1`) then the value is treated as single
   *     value (e.g.: `{ foo: '1' }`).
   *
   * <pre>params: {
   *     param1: { array: true }
   * }</pre>
   *
   *   - ** squash ** - {bool|string=}: `squash` configures how a default parameter value is represented in the URL when
   *     the current parameter value is the same as the default value. If `squash` is not set, it uses the
   *     configured default squash policy.
   *     (See {@link ui.router.util.$urlMatcherFactory#methods_defaultSquashPolicy `defaultSquashPolicy()`})
   *
   *   There are three squash settings:
   *
   *     - false: The parameter's default value is not squashed.  It is encoded and included in the URL
   *     - true: The parameter's default value is omitted from the URL.  If the parameter is preceeded and followed
   *       by slashes in the state's `url` declaration, then one of those slashes are omitted.
   *       This can allow for cleaner looking URLs.
   *     - `"<arbitrary string>"`: The parameter's default value is replaced with an arbitrary placeholder of  your choice.
   *
   * <pre>params: {
   *     param1: {
   *       value: "defaultId",
   *       squash: true
   * } }
   * // squash "defaultValue" to "~"
   * params: {
   *     param1: {
   *       value: "defaultValue",
   *       squash: "~"
   * } }
   * </pre>
   *
   *
   * @example
   * <pre>
   * // Some state name examples
   *
   * // stateName can be a single top-level name (must be unique).
   * $stateProvider.state("home", {});
   *
   * // Or it can be a nested state name. This state is a child of the
   * // above "home" state.
   * $stateProvider.state("home.newest", {});
   *
   * // Nest states as deeply as needed.
   * $stateProvider.state("home.newest.abc.xyz.inception", {});
   *
   * // state() returns $stateProvider, so you can chain state declarations.
   * $stateProvider
   *   .state("home", {})
   *   .state("about", {})
   *   .state("contacts", {});
   * </pre>
   *
   */
    this.state = state;
    function state(name, definition) {
      /*jshint validthis: true */
      if (isObject(name))
        definition = name;
      else
        definition.name = name;
      registerState(definition);
      return this;
    }
    /**
   * @ngdoc object
   * @name ui.router.state.$state
   *
   * @requires $rootScope
   * @requires $q
   * @requires ui.router.state.$view
   * @requires $injector
   * @requires ui.router.util.$resolve
   * @requires ui.router.state.$stateParams
   * @requires ui.router.router.$urlRouter
   *
   * @property {object} params A param object, e.g. {sectionId: section.id)}, that 
   * you'd like to test against the current active state.
   * @property {object} current A reference to the state's config object. However 
   * you passed it in. Useful for accessing custom data.
   * @property {object} transition Currently pending transition. A promise that'll 
   * resolve or reject.
   *
   * @description
   * `$state` service is responsible for representing states as well as transitioning
   * between them. It also provides interfaces to ask for current state or even states
   * you're coming from.
   */
    this.$get = $get;
    $get.$inject = [
      '$rootScope',
      '$q',
      '$view',
      '$injector',
      '$resolve',
      '$stateParams',
      '$urlRouter',
      '$location',
      '$urlMatcherFactory'
    ];
    function $get($rootScope, $q, $view, $injector, $resolve, $stateParams, $urlRouter, $location, $urlMatcherFactory) {
      var TransitionSuperseded = $q.reject(new Error('transition superseded'));
      var TransitionPrevented = $q.reject(new Error('transition prevented'));
      var TransitionAborted = $q.reject(new Error('transition aborted'));
      var TransitionFailed = $q.reject(new Error('transition failed'));
      // Handles the case where a state which is the target of a transition is not found, and the user
      // can optionally retry or defer the transition
      function handleRedirect(redirect, state, params, options) {
        /**
       * @ngdoc event
       * @name ui.router.state.$state#$stateNotFound
       * @eventOf ui.router.state.$state
       * @eventType broadcast on root scope
       * @description
       * Fired when a requested state **cannot be found** using the provided state name during transition.
       * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
       * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
       * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
       * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
       *
       * @param {Object} event Event object.
       * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
       * @param {State} fromState Current state object.
       * @param {Object} fromParams Current state params.
       *
       * @example
       *
       * <pre>
       * // somewhere, assume lazy.state has not been defined
       * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
       *
       * // somewhere else
       * $scope.$on('$stateNotFound',
       * function(event, unfoundState, fromState, fromParams){
       *     console.log(unfoundState.to); // "lazy.state"
       *     console.log(unfoundState.toParams); // {a:1, b:2}
       *     console.log(unfoundState.options); // {inherit:false} + default options
       * })
       * </pre>
       */
        var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params);
        if (evt.defaultPrevented) {
          $urlRouter.update();
          return TransitionAborted;
        }
        if (!evt.retry) {
          return null;
        }
        // Allow the handler to return a promise to defer state lookup retry
        if (options.$retry) {
          $urlRouter.update();
          return TransitionFailed;
        }
        var retryTransition = $state.transition = $q.when(evt.retry);
        retryTransition.then(function () {
          if (retryTransition !== $state.transition)
            return TransitionSuperseded;
          redirect.options.$retry = true;
          return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
        }, function () {
          return TransitionAborted;
        });
        $urlRouter.update();
        return retryTransition;
      }
      root.locals = {
        resolve: null,
        globals: { $stateParams: {} }
      };
      $state = {
        params: {},
        current: root.self,
        $current: root,
        transition: null
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#reload
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method that force reloads the current state. All resolves are re-resolved, events are not re-fired, 
     * and controllers reinstantiated (bug with controllers reinstantiating right now, fixing soon).
     *
     * @example
     * <pre>
     * var app angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     $state.reload();
     *   }
     * });
     * </pre>
     *
     * `reload()` is just an alias for:
     * <pre>
     * $state.transitionTo($state.current, $stateParams, { 
     *   reload: true, inherit: false, notify: true
     * });
     * </pre>
     *
     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
      $state.reload = function reload() {
        return $state.transitionTo($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#go
     * @methodOf ui.router.state.$state
     *
     * @description
     * Convenience method for transitioning to a new state. `$state.go` calls 
     * `$state.transitionTo` internally but automatically sets options to 
     * `{ location: true, inherit: true, relative: $state.$current, notify: true }`. 
     * This allows you to easily use an absolute or relative to path and specify 
     * only the parameters you'd like to update (while letting unspecified parameters 
     * inherit from the currently active ancestor states).
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.go('contact.detail');
     *   };
     * });
     * </pre>
     * <img src='../ngdoc_assets/StateGoExamples.png'/>
     *
     * @param {string} to Absolute state name or relative state path. Some examples:
     *
     * - `$state.go('contact.detail')` - will go to the `contact.detail` state
     * - `$state.go('^')` - will go to a parent state
     * - `$state.go('^.sibling')` - will go to a sibling state
     * - `$state.go('.child.grandchild')` - will go to grandchild state
     *
     * @param {object=} params A map of the parameters that will be sent to the state, 
     * will populate $stateParams. Any parameters that are not specified will be inherited from currently 
     * defined parameters. This allows, for example, going to a sibling state that shares parameters
     * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
     * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
     * will get you all current parameters, etc.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *
     * @returns {promise} A promise representing the state of the new transition.
     *
     * Possible success values:
     *
     * - $state.current
     *
     * <br/>Possible rejection values:
     *
     * - 'transition superseded' - when a newer transition has been started after this one
     * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
     * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
     *   when a `$stateNotFound` `event.retry` promise errors.
     * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
     * - *resolve error* - when an error has occurred with a `resolve`
     *
     */
      $state.go = function go(to, params, options) {
        return $state.transitionTo(to, params, extend({
          inherit: true,
          relative: $state.$current
        }, options));
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#transitionTo
     * @methodOf ui.router.state.$state
     *
     * @description
     * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
     * uses `transitionTo` internally. `$state.go` is recommended in most situations.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.transitionTo('contact.detail');
     *   };
     * });
     * </pre>
     *
     * @param {string} to State name.
     * @param {object=} toParams A map of the parameters that will be sent to the state,
     * will populate $stateParams.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *
     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
      $state.transitionTo = function transitionTo(to, toParams, options) {
        toParams = toParams || {};
        options = extend({
          location: true,
          inherit: false,
          relative: null,
          notify: true,
          reload: false,
          $retry: false
        }, options || {});
        var from = $state.$current, fromParams = $state.params, fromPath = from.path;
        var evt, toState = findState(to, options.relative);
        if (!isDefined(toState)) {
          var redirect = {
              to: to,
              toParams: toParams,
              options: options
            };
          var redirectResult = handleRedirect(redirect, from.self, fromParams, options);
          if (redirectResult) {
            return redirectResult;
          }
          // Always retry once if the $stateNotFound was not prevented
          // (handles either redirect changed or state lazy-definition)
          to = redirect.to;
          toParams = redirect.toParams;
          options = redirect.options;
          toState = findState(to, options.relative);
          if (!isDefined(toState)) {
            if (!options.relative)
              throw new Error('No such state \'' + to + '\'');
            throw new Error('Could not resolve \'' + to + '\' from state \'' + options.relative + '\'');
          }
        }
        if (toState[abstractKey])
          throw new Error('Cannot transition to abstract state \'' + to + '\'');
        if (options.inherit)
          toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
        if (!toState.params.$$validates(toParams))
          return TransitionFailed;
        toParams = toState.params.$$values(toParams);
        to = toState;
        var toPath = to.path;
        // Starting from the root of the path, keep all levels that haven't changed
        var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];
        if (!options.reload) {
          while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
            locals = toLocals[keep] = state.locals;
            keep++;
            state = toPath[keep];
          }
        }
        // If we're going to the same state and all locals are kept, we've got nothing to do.
        // But clear 'transition', as we still want to cancel any other pending transitions.
        // TODO: We may not want to bump 'transition' if we're called from a location change
        // that we've initiated ourselves, because we might accidentally abort a legitimate
        // transition initiated from code?
        if (shouldTriggerReload(to, from, locals, options)) {
          if (to.self.reloadOnSearch !== false)
            $urlRouter.update();
          $state.transition = null;
          return $q.when($state.current);
        }
        // Filter parameters before we pass them to event handlers etc.
        toParams = filterByKeys(to.params.$$keys(), toParams || {});
        // Broadcast start event and cancel the transition if requested
        if (options.notify) {
          /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeStart
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when the state transition **begins**. You can use `event.preventDefault()`
         * to prevent the transition from happening and then the transition promise will be
         * rejected with a `'transition prevented'` value.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         *
         * @example
         *
         * <pre>
         * $rootScope.$on('$stateChangeStart',
         * function(event, toState, toParams, fromState, fromParams){
         *     event.preventDefault();
         *     // transitionTo() promise will be rejected with
         *     // a 'transition prevented' error
         * })
         * </pre>
         */
          if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams).defaultPrevented) {
            $urlRouter.update();
            return TransitionPrevented;
          }
        }
        // Resolve locals for the remaining states, but don't update any global state just
        // yet -- if anything fails to resolve the current state needs to remain untouched.
        // We also set up an inheritance chain for the locals here. This allows the view directive
        // to quickly look up the correct definition for each view in the current state. Even
        // though we create the locals object itself outside resolveState(), it is initially
        // empty and gets filled asynchronously. We need to keep track of the promise for the
        // (fully resolved) current locals, and pass this down the chain.
        var resolved = $q.when(locals);
        for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
          locals = toLocals[l] = inherit(locals);
          resolved = resolveState(state, toParams, state === to, resolved, locals, options);
        }
        // Once everything is resolved, we are ready to perform the actual transition
        // and return a promise for the new state. We also keep track of what the
        // current promise is, so that we can detect overlapping transitions and
        // keep only the outcome of the last transition.
        var transition = $state.transition = resolved.then(function () {
            var l, entering, exiting;
            if ($state.transition !== transition)
              return TransitionSuperseded;
            // Exit 'from' states not kept
            for (l = fromPath.length - 1; l >= keep; l--) {
              exiting = fromPath[l];
              if (exiting.self.onExit) {
                $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
              }
              exiting.locals = null;
            }
            // Enter 'to' states not kept
            for (l = keep; l < toPath.length; l++) {
              entering = toPath[l];
              entering.locals = toLocals[l];
              if (entering.self.onEnter) {
                $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
              }
            }
            // Run it again, to catch any transitions in callbacks
            if ($state.transition !== transition)
              return TransitionSuperseded;
            // Update globals in $state
            $state.$current = to;
            $state.current = to.self;
            $state.params = toParams;
            copy($state.params, $stateParams);
            $state.transition = null;
            if (options.location && to.navigable) {
              $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
                $$avoidResync: true,
                replace: options.location === 'replace'
              });
            }
            if (options.notify) {
              /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeSuccess
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired once the state transition is **complete**.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         */
              $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
            }
            $urlRouter.update(true);
            return $state.current;
          }, function (error) {
            if ($state.transition !== transition)
              return TransitionSuperseded;
            $state.transition = null;
            /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeError
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when an **error occurs** during transition. It's important to note that if you
         * have any errors in your resolve functions (javascript errors, non-existent services, etc)
         * they will not throw traditionally. You must listen for this $stateChangeError event to
         * catch **ALL** errors.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         * @param {Error} error The resolve error object.
         */
            evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);
            if (!evt.defaultPrevented) {
              $urlRouter.update();
            }
            return $q.reject(error);
          });
        return transition;
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#is
     * @methodOf ui.router.state.$state
     *
     * @description
     * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
     * but only checks for the full state name. If params is supplied then it will be
     * tested for strict equality against the current active params object, so all params
     * must match with none missing and no extras.
     *
     * @example
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * // absolute name
     * $state.is('contact.details.item'); // returns true
     * $state.is(contactDetailItemStateObject); // returns true
     *
     * // relative name (. and ^), typically from a template
     * // E.g. from the 'contacts.details' template
     * <div ng-class="{highlighted: $state.is('.item')}">Item</div>
     * </pre>
     *
     * @param {string|object} stateOrName The state name (absolute or relative) or state object you'd like to check.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like
     * to test against the current active state.
     * @param {object=} options An options object.  The options are:
     *
     * - **`relative`** - {string|object} -  If `stateOrName` is a relative state name and `options.relative` is set, .is will
     * test relative to `options.relative` state (or name).
     *
     * @returns {boolean} Returns true if it is the state.
     */
      $state.is = function is(stateOrName, params, options) {
        options = extend({ relative: $state.$current }, options || {});
        var state = findState(stateOrName, options.relative);
        if (!isDefined(state)) {
          return undefined;
        }
        if ($state.$current !== state) {
          return false;
        }
        return params ? equalForKeys(state.params.$$values(params), $stateParams) : true;
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#includes
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method to determine if the current active state is equal to or is the child of the
     * state stateName. If any params are passed then they will be tested for a match as well.
     * Not all the parameters need to be passed, just the ones you'd like to test for equality.
     *
     * @example
     * Partial and relative names
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * // Using partial names
     * $state.includes("contacts"); // returns true
     * $state.includes("contacts.details"); // returns true
     * $state.includes("contacts.details.item"); // returns true
     * $state.includes("contacts.list"); // returns false
     * $state.includes("about"); // returns false
     *
     * // Using relative names (. and ^), typically from a template
     * // E.g. from the 'contacts.details' template
     * <div ng-class="{highlighted: $state.includes('.item')}">Item</div>
     * </pre>
     *
     * Basic globbing patterns
     * <pre>
     * $state.$current.name = 'contacts.details.item.url';
     *
     * $state.includes("*.details.*.*"); // returns true
     * $state.includes("*.details.**"); // returns true
     * $state.includes("**.item.**"); // returns true
     * $state.includes("*.details.item.url"); // returns true
     * $state.includes("*.details.*.url"); // returns true
     * $state.includes("*.details.*"); // returns false
     * $state.includes("item.**"); // returns false
     * </pre>
     *
     * @param {string} stateOrName A partial name, relative name, or glob pattern
     * to be searched for within the current state name.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`,
     * that you'd like to test against the current active state.
     * @param {object=} options An options object.  The options are:
     *
     * - **`relative`** - {string|object=} -  If `stateOrName` is a relative state reference and `options.relative` is set,
     * .includes will test relative to `options.relative` state (or name).
     *
     * @returns {boolean} Returns true if it does include the state
     */
      $state.includes = function includes(stateOrName, params, options) {
        options = extend({ relative: $state.$current }, options || {});
        if (isString(stateOrName) && isGlob(stateOrName)) {
          if (!doesStateMatchGlob(stateOrName)) {
            return false;
          }
          stateOrName = $state.$current.name;
        }
        var state = findState(stateOrName, options.relative);
        if (!isDefined(state)) {
          return undefined;
        }
        if (!isDefined($state.$current.includes[state.name])) {
          return false;
        }
        return params ? equalForKeys(state.params.$$values(params), $stateParams, objectKeys(params)) : true;
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#href
     * @methodOf ui.router.state.$state
     *
     * @description
     * A url generation method that returns the compiled url for the given state populated with the given params.
     *
     * @example
     * <pre>
     * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
     * </pre>
     *
     * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
     * @param {object=} params An object of parameter values to fill the state's required parameters.
     * @param {object=} options Options object. The options are:
     *
     * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
     *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
     *    ancestor with a valid url).
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
     * 
     * @returns {string} compiled state url
     */
      $state.href = function href(stateOrName, params, options) {
        options = extend({
          lossy: true,
          inherit: true,
          absolute: false,
          relative: $state.$current
        }, options || {});
        var state = findState(stateOrName, options.relative);
        if (!isDefined(state))
          return null;
        if (options.inherit)
          params = inheritParams($stateParams, params || {}, $state.$current, state);
        var nav = state && options.lossy ? state.navigable : state;
        if (!nav || nav.url === undefined || nav.url === null) {
          return null;
        }
        return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys(), params || {}), { absolute: options.absolute });
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#get
     * @methodOf ui.router.state.$state
     *
     * @description
     * Returns the state configuration object for any specific state or all states.
     *
     * @param {string|object=} stateOrName (absolute or relative) If provided, will only get the config for
     * the requested state. If not provided, returns an array of ALL state configs.
     * @param {string|object=} context When stateOrName is a relative state reference, the state will be retrieved relative to context.
     * @returns {Object|Array} State configuration object or array of all objects.
     */
      $state.get = function (stateOrName, context) {
        if (arguments.length === 0)
          return map(objectKeys(states), function (name) {
            return states[name].self;
          });
        var state = findState(stateOrName, context || $state.$current);
        return state && state.self ? state.self : null;
      };
      function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
        // Make a restricted $stateParams with only the parameters that apply to this state if
        // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
        // we also need $stateParams to be available for any $injector calls we make during the
        // dependency resolution process.
        var $stateParams = paramsAreFiltered ? params : filterByKeys(state.params.$$keys(), params);
        var locals = { $stateParams: $stateParams };
        // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
        // We're also including $stateParams in this; that way the parameters are restricted
        // to the set that should be visible to the state, and are independent of when we update
        // the global $state and $stateParams values.
        dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
        var promises = [dst.resolve.then(function (globals) {
              dst.globals = globals;
            })];
        if (inherited)
          promises.push(inherited);
        // Resolve template and dependencies for all views.
        forEach(state.views, function (view, name) {
          var injectables = view.resolve && view.resolve !== state.resolve ? view.resolve : {};
          injectables.$template = [function () {
              return $view.load(name, {
                view: view,
                locals: locals,
                params: $stateParams,
                notify: options.notify
              }) || '';
            }];
          promises.push($resolve.resolve(injectables, locals, dst.resolve, state).then(function (result) {
            // References to the controller (only instantiated at link time)
            if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
              var injectLocals = angular.extend({}, injectables, locals);
              result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
            } else {
              result.$$controller = view.controller;
            }
            // Provide access to the state itself for internal use
            result.$$state = state;
            result.$$controllerAs = view.controllerAs;
            dst[name] = result;
          }));
        });
        // Wait for all the promises and then return the activation object
        return $q.all(promises).then(function (values) {
          return dst;
        });
      }
      return $state;
    }
    function shouldTriggerReload(to, from, locals, options) {
      if (to === from && (locals === from.locals && !options.reload || to.self.reloadOnSearch === false)) {
        return true;
      }
    }
  }
  angular.module('ui.router.state').value('$stateParams', {}).provider('$state', $StateProvider);
  $ViewProvider.$inject = [];
  function $ViewProvider() {
    this.$get = $get;
    /**
   * @ngdoc object
   * @name ui.router.state.$view
   *
   * @requires ui.router.util.$templateFactory
   * @requires $rootScope
   *
   * @description
   *
   */
    $get.$inject = [
      '$rootScope',
      '$templateFactory'
    ];
    function $get($rootScope, $templateFactory) {
      return {
        load: function load(name, options) {
          var result, defaults = {
              template: null,
              controller: null,
              view: null,
              locals: null,
              notify: true,
              async: true,
              params: {}
            };
          options = extend(defaults, options);
          if (options.view) {
            result = $templateFactory.fromConfig(options.view, options.params, options.locals);
          }
          if (result && options.notify) {
            /**
         * @ngdoc event
         * @name ui.router.state.$state#$viewContentLoading
         * @eventOf ui.router.state.$view
         * @eventType broadcast on root scope
         * @description
         *
         * Fired once the view **begins loading**, *before* the DOM is rendered.
         *
         * @param {Object} event Event object.
         * @param {Object} viewConfig The view config properties (template, controller, etc).
         *
         * @example
         *
         * <pre>
         * $scope.$on('$viewContentLoading',
         * function(event, viewConfig){
         *     // Access to all the view config properties.
         *     // and one special property 'targetView'
         *     // viewConfig.targetView
         * });
         * </pre>
         */
            $rootScope.$broadcast('$viewContentLoading', options);
          }
          return result;
        }
      };
    }
  }
  angular.module('ui.router.state').provider('$view', $ViewProvider);
  /**
 * @ngdoc object
 * @name ui.router.state.$uiViewScrollProvider
 *
 * @description
 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
 */
  function $ViewScrollProvider() {
    var useAnchorScroll = false;
    /**
   * @ngdoc function
   * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
   * @methodOf ui.router.state.$uiViewScrollProvider
   *
   * @description
   * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
   * scrolling based on the url anchor.
   */
    this.useAnchorScroll = function () {
      useAnchorScroll = true;
    };
    /**
   * @ngdoc object
   * @name ui.router.state.$uiViewScroll
   *
   * @requires $anchorScroll
   * @requires $timeout
   *
   * @description
   * When called with a jqLite element, it scrolls the element into view (after a
   * `$timeout` so the DOM has time to refresh).
   *
   * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
   * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
   */
    this.$get = [
      '$anchorScroll',
      '$timeout',
      function ($anchorScroll, $timeout) {
        if (useAnchorScroll) {
          return $anchorScroll;
        }
        return function ($element) {
          $timeout(function () {
            $element[0].scrollIntoView();
          }, 0, false);
        };
      }
    ];
  }
  angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-view
 *
 * @requires ui.router.state.$state
 * @requires $compile
 * @requires $controller
 * @requires $injector
 * @requires ui.router.state.$uiViewScroll
 * @requires $document
 *
 * @restrict ECA
 *
 * @description
 * The ui-view directive tells $state where to place your templates.
 *
 * @param {string=} name A view name. The name should be unique amongst the other views in the
 * same state. You can have views of the same name that live in different states.
 *
 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
 * scroll ui-view elements into view when they are populated during a state activation.
 *
 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
 *
 * @param {string=} onload Expression to evaluate whenever the view updates.
 * 
 * @example
 * A view can be unnamed or named. 
 * <pre>
 * <!-- Unnamed -->
 * <div ui-view></div> 
 * 
 * <!-- Named -->
 * <div ui-view="viewName"></div>
 * </pre>
 *
 * You can only have one unnamed view within any template (or root html). If you are only using a 
 * single view and it is unnamed then you can populate it like so:
 * <pre>
 * <div ui-view></div> 
 * $stateProvider.state("home", {
 *   template: "<h1>HELLO!</h1>"
 * })
 * </pre>
 * 
 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#views `views`}
 * config property, by name, in this case an empty name:
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 * 
 * But typically you'll only use the views property if you name your view or have more than one view 
 * in the same template. There's not really a compelling reason to name a view if its the only one, 
 * but you could if you wanted, like so:
 * <pre>
 * <div ui-view="main"></div>
 * </pre> 
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "main": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 * 
 * Really though, you'll use views to set up multiple views:
 * <pre>
 * <div ui-view></div>
 * <div ui-view="chart"></div> 
 * <div ui-view="data"></div> 
 * </pre>
 * 
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     },
 *     "chart": {
 *       template: "<chart_thing/>"
 *     },
 *     "data": {
 *       template: "<data_thing/>"
 *     }
 *   }    
 * })
 * </pre>
 *
 * Examples for `autoscroll`:
 *
 * <pre>
 * <!-- If autoscroll present with no expression,
 *      then scroll ui-view into view -->
 * <ui-view autoscroll/>
 *
 * <!-- If autoscroll present with valid expression,
 *      then scroll ui-view into view if expression evaluates to true -->
 * <ui-view autoscroll='true'/>
 * <ui-view autoscroll='false'/>
 * <ui-view autoscroll='scopeVariable'/>
 * </pre>
 */
  $ViewDirective.$inject = [
    '$state',
    '$injector',
    '$uiViewScroll',
    '$interpolate'
  ];
  function $ViewDirective($state, $injector, $uiViewScroll, $interpolate) {
    function getService() {
      return $injector.has ? function (service) {
        return $injector.has(service) ? $injector.get(service) : null;
      } : function (service) {
        try {
          return $injector.get(service);
        } catch (e) {
          return null;
        }
      };
    }
    var service = getService(), $animator = service('$animator'), $animate = service('$animate');
    // Returns a set of DOM manipulation functions based on which Angular version
    // it should use
    function getRenderer(attrs, scope) {
      var statics = function () {
        return {
          enter: function (element, target, cb) {
            target.after(element);
            cb();
          },
          leave: function (element, cb) {
            element.remove();
            cb();
          }
        };
      };
      if ($animate) {
        return {
          enter: function (element, target, cb) {
            var promise = $animate.enter(element, null, target, cb);
            if (promise && promise.then)
              promise.then(cb);
          },
          leave: function (element, cb) {
            var promise = $animate.leave(element, cb);
            if (promise && promise.then)
              promise.then(cb);
          }
        };
      }
      if ($animator) {
        var animate = $animator && $animator(scope, attrs);
        return {
          enter: function (element, target, cb) {
            animate.enter(element, null, target);
            cb();
          },
          leave: function (element, cb) {
            animate.leave(element);
            cb();
          }
        };
      }
      return statics();
    }
    var directive = {
        restrict: 'ECA',
        terminal: true,
        priority: 400,
        transclude: 'element',
        compile: function (tElement, tAttrs, $transclude) {
          return function (scope, $element, attrs) {
            var previousEl, currentEl, currentScope, latestLocals, onloadExp = attrs.onload || '', autoScrollExp = attrs.autoscroll, renderer = getRenderer(attrs, scope);
            scope.$on('$stateChangeSuccess', function () {
              updateView(false);
            });
            scope.$on('$viewContentLoading', function () {
              updateView(false);
            });
            updateView(true);
            function cleanupLastView() {
              if (previousEl) {
                previousEl.remove();
                previousEl = null;
              }
              if (currentScope) {
                currentScope.$destroy();
                currentScope = null;
              }
              if (currentEl) {
                renderer.leave(currentEl, function () {
                  previousEl = null;
                });
                previousEl = currentEl;
                currentEl = null;
              }
            }
            function updateView(firstTime) {
              var newScope, name = getUiViewName(scope, attrs, $element, $interpolate), previousLocals = name && $state.$current && $state.$current.locals[name];
              if (!firstTime && previousLocals === latestLocals)
                return;
              // nothing to do
              newScope = scope.$new();
              latestLocals = $state.$current.locals[name];
              var clone = $transclude(newScope, function (clone) {
                  renderer.enter(clone, $element, function onUiViewEnter() {
                    if (currentScope) {
                      currentScope.$emit('$viewContentAnimationEnded');
                    }
                    if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                      $uiViewScroll(clone);
                    }
                  });
                  cleanupLastView();
                });
              currentEl = clone;
              currentScope = newScope;
              /**
           * @ngdoc event
           * @name ui.router.state.directive:ui-view#$viewContentLoaded
           * @eventOf ui.router.state.directive:ui-view
           * @eventType emits on ui-view directive scope
           * @description           *
           * Fired once the view is **loaded**, *after* the DOM is rendered.
           *
           * @param {Object} event Event object.
           */
              currentScope.$emit('$viewContentLoaded');
              currentScope.$eval(onloadExp);
            }
          };
        }
      };
    return directive;
  }
  $ViewDirectiveFill.$inject = [
    '$compile',
    '$controller',
    '$state',
    '$interpolate'
  ];
  function $ViewDirectiveFill($compile, $controller, $state, $interpolate) {
    return {
      restrict: 'ECA',
      priority: -400,
      compile: function (tElement) {
        var initial = tElement.html();
        return function (scope, $element, attrs) {
          var current = $state.$current, name = getUiViewName(scope, attrs, $element, $interpolate), locals = current && current.locals[name];
          if (!locals) {
            return;
          }
          $element.data('$uiView', {
            name: name,
            state: locals.$$state
          });
          $element.html(locals.$template ? locals.$template : initial);
          var link = $compile($element.contents());
          if (locals.$$controller) {
            locals.$scope = scope;
            var controller = $controller(locals.$$controller, locals);
            if (locals.$$controllerAs) {
              scope[locals.$$controllerAs] = controller;
            }
            $element.data('$ngControllerController', controller);
            $element.children().data('$ngControllerController', controller);
          }
          link(scope);
        };
      }
    };
  }
  /**
 * Shared ui-view code for both directives:
 * Given scope, element, and its attributes, return the view's name
 */
  function getUiViewName(scope, attrs, element, $interpolate) {
    var name = $interpolate(attrs.uiView || attrs.name || '')(scope);
    var inherited = element.inheritedData('$uiView');
    return name.indexOf('@') >= 0 ? name : name + '@' + (inherited ? inherited.state.name : '');
  }
  angular.module('ui.router.state').directive('uiView', $ViewDirective);
  angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);
  function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed)
      ref = current + '(' + preparsed[1] + ')';
    parsed = ref.replace(/\n/g, ' ').match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4)
      throw new Error('Invalid state ref \'' + ref + '\'');
    return {
      state: parsed[1],
      paramExpr: parsed[3] || null
    };
  }
  function stateContext(el) {
    var stateData = el.parent().inheritedData('$uiView');
    if (stateData && stateData.state && stateData.state.name) {
      return stateData.state;
    }
  }
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref
 *
 * @requires ui.router.state.$state
 * @requires $timeout
 *
 * @restrict A
 *
 * @description
 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated 
 * URL, the directive will automatically generate & update the `href` attribute via 
 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking 
 * the link will trigger a state transition with optional parameters. 
 *
 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be 
 * handled natively by the browser.
 *
 * You can also use relative state paths within ui-sref, just like the relative 
 * paths passed to `$state.go()`. You just need to be aware that the path is relative
 * to the state that the link lives in, in other words the state that loaded the 
 * template containing the link.
 *
 * You can specify options to pass to {@link ui.router.state.$state#go $state.go()}
 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
 * and `reload`.
 *
 * @example
 * Here's an example of how you'd use ui-sref and how it would compile. If you have the 
 * following template:
 * <pre>
 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
 * 
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
 *     </li>
 * </ul>
 * </pre>
 * 
 * Then the compiled html would be (assuming Html5Mode is off and current state is contacts):
 * <pre>
 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a> | <a href="#/contacts?page=2" ui-sref="{page: 2}">Next page</a>
 * 
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
 *     </li>
 * </ul>
 *
 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
 * </pre>
 *
 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#go $state.go()}
 */
  $StateRefDirective.$inject = [
    '$state',
    '$timeout'
  ];
  function $StateRefDirective($state, $timeout) {
    var allowedOptions = [
        'location',
        'inherit',
        'reload'
      ];
    return {
      restrict: 'A',
      require: [
        '?^uiSrefActive',
        '?^uiSrefActiveEq'
      ],
      link: function (scope, element, attrs, uiSrefActive) {
        var ref = parseStateRef(attrs.uiSref, $state.current.name);
        var params = null, url = null, base = stateContext(element) || $state.$current;
        var newHref = null, isAnchor = element.prop('tagName') === 'A';
        var isForm = element[0].nodeName === 'FORM';
        var attr = isForm ? 'action' : 'href', nav = true;
        var options = {
            relative: base,
            inherit: true
          };
        var optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};
        angular.forEach(allowedOptions, function (option) {
          if (option in optionsOverride) {
            options[option] = optionsOverride[option];
          }
        });
        var update = function (newVal) {
          if (newVal)
            params = angular.copy(newVal);
          if (!nav)
            return;
          newHref = $state.href(ref.state, params, options);
          var activeDirective = uiSrefActive[1] || uiSrefActive[0];
          if (activeDirective) {
            activeDirective.$$setStateInfo(ref.state, params);
          }
          if (newHref === null) {
            nav = false;
            return false;
          }
          attrs.$set(attr, newHref);
        };
        if (ref.paramExpr) {
          scope.$watch(ref.paramExpr, function (newVal, oldVal) {
            if (newVal !== params)
              update(newVal);
          }, true);
          params = angular.copy(scope.$eval(ref.paramExpr));
        }
        update();
        if (isForm)
          return;
        element.bind('click', function (e) {
          var button = e.which || e.button;
          if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target'))) {
            // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
            var transition = $timeout(function () {
                $state.go(ref.state, params, options);
              });
            e.preventDefault();
            // if the state has no URL, ignore one preventDefault from the <a> directive.
            var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
            e.preventDefault = function () {
              if (ignorePreventDefaultCount-- <= 0)
                $timeout.cancel(transition);
            };
          }
        });
      }
    };
  }
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * A directive working alongside ui-sref to add classes to an element when the
 * related ui-sref directive's state is active, and removing them when it is inactive.
 * The primary use-case is to simplify the special appearance of navigation menus
 * relying on `ui-sref`, by having the "active" state's menu button appear different,
 * distinguishing it from the inactive menu items.
 *
 * ui-sref-active can live on the same element as ui-sref or on a parent element. The first
 * ui-sref-active found at the same level or above the ui-sref will be used.
 *
 * Will activate when the ui-sref's target state or any child state is active. If you
 * need to activate only when the ui-sref target state is active and *not* any of
 * it's children, then you will use
 * {@link ui.router.state.directive:ui-sref-active-eq ui-sref-active-eq}
 *
 * @example
 * Given the following template:
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item">
 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 *
 * When the app state is "app.user" (or any children states), and contains the state parameter "user" with value "bilbobaggins",
 * the resulting HTML will appear as (note the 'active' class):
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item active">
 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 * The class name is interpolated **once** during the directives link time (any further changes to the
 * interpolated value are ignored).
 *
 * Multiple classes may be specified in a space-separated format:
 * <pre>
 * <ul>
 *   <li ui-sref-active='class1 class2 class3'>
 *     <a ui-sref="app.user">link</a>
 *   </li>
 * </ul>
 * </pre>
 */
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active-eq
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * The same as {@link ui.router.state.directive:ui-sref-active ui-sref-active} but will only activate
 * when the exact target state used in the `ui-sref` is active; no child states.
 *
 */
  $StateRefActiveDirective.$inject = [
    '$state',
    '$stateParams',
    '$interpolate'
  ];
  function $StateRefActiveDirective($state, $stateParams, $interpolate) {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        '$element',
        '$attrs',
        function ($scope, $element, $attrs) {
          var state, params, activeClass;
          // There probably isn't much point in $observing this
          // uiSrefActive and uiSrefActiveEq share the same directive object with some
          // slight difference in logic routing
          activeClass = $interpolate($attrs.uiSrefActiveEq || $attrs.uiSrefActive || '', false)($scope);
          // Allow uiSref to communicate with uiSrefActive[Equals]
          this.$$setStateInfo = function (newState, newParams) {
            state = $state.get(newState, stateContext($element));
            params = newParams;
            update();
          };
          $scope.$on('$stateChangeSuccess', update);
          // Update route state
          function update() {
            if (isMatch()) {
              $element.addClass(activeClass);
            } else {
              $element.removeClass(activeClass);
            }
          }
          function isMatch() {
            if (typeof $attrs.uiSrefActiveEq !== 'undefined') {
              return state && $state.is(state.name, params);
            } else {
              return state && $state.includes(state.name, params);
            }
          }
        }
      ]
    };
  }
  angular.module('ui.router.state').directive('uiSref', $StateRefDirective).directive('uiSrefActive', $StateRefActiveDirective).directive('uiSrefActiveEq', $StateRefActiveDirective);
  /**
 * @ngdoc filter
 * @name ui.router.state.filter:isState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
 */
  $IsStateFilter.$inject = ['$state'];
  function $IsStateFilter($state) {
    var isFilter = function (state) {
      return $state.is(state);
    };
    isFilter.$stateful = true;
    return isFilter;
  }
  /**
 * @ngdoc filter
 * @name ui.router.state.filter:includedByState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
 */
  $IncludedByStateFilter.$inject = ['$state'];
  function $IncludedByStateFilter($state) {
    var includesFilter = function (state) {
      return $state.includes(state);
    };
    includesFilter.$stateful = true;
    return includesFilter;
  }
  angular.module('ui.router.state').filter('isState', $IsStateFilter).filter('includedByState', $IncludedByStateFilter);
}(window, window.angular));
/**
 * @license Angular UI Tree v2.1.5
 * (c) 2010-2014. https://github.com/JimLiu/angular-ui-tree
 * License: MIT
 */
!function () {
  'use strict';
  angular.module('ui.tree', []).constant('treeConfig', {
    treeClass: 'angular-ui-tree',
    emptyTreeClass: 'angular-ui-tree-empty',
    hiddenClass: 'angular-ui-tree-hidden',
    nodesClass: 'angular-ui-tree-nodes',
    nodeClass: 'angular-ui-tree-node',
    handleClass: 'angular-ui-tree-handle',
    placeHolderClass: 'angular-ui-tree-placeholder',
    dragClass: 'angular-ui-tree-drag',
    dragThreshold: 3,
    levelThreshold: 30
  });
}(), function () {
  'use strict';
  angular.module('ui.tree').factory('$uiTreeHelper', [
    '$document',
    '$window',
    function ($document, $window) {
      return {
        nodesData: {},
        setNodeAttribute: function (scope, attrName, val) {
          var data = this.nodesData[scope.$modelValue.$$hashKey];
          data || (data = {}, this.nodesData[scope.$modelValue.$$hashKey] = data), data[attrName] = val;
        },
        getNodeAttribute: function (scope, attrName) {
          var data = this.nodesData[scope.$modelValue.$$hashKey];
          return data ? data[attrName] : null;
        },
        nodrag: function (targetElm) {
          return 'undefined' != typeof targetElm.attr('data-nodrag');
        },
        eventObj: function (e) {
          var obj = e;
          return void 0 !== e.targetTouches ? obj = e.targetTouches.item(0) : void 0 !== e.originalEvent && void 0 !== e.originalEvent.targetTouches && (obj = e.originalEvent.targetTouches.item(0)), obj;
        },
        dragInfo: function (node) {
          return {
            source: node,
            sourceInfo: {
              nodeScope: node,
              index: node.index(),
              nodesScope: node.$parentNodesScope
            },
            index: node.index(),
            siblings: node.siblings().slice(0),
            parent: node.$parentNodesScope,
            moveTo: function (parent, siblings, index) {
              this.parent = parent, this.siblings = siblings.slice(0);
              var i = this.siblings.indexOf(this.source);
              i > -1 && (this.siblings.splice(i, 1), this.source.index() < index && index--), this.siblings.splice(index, 0, this.source), this.index = index;
            },
            parentNode: function () {
              return this.parent.$nodeScope;
            },
            prev: function () {
              return this.index > 0 ? this.siblings[this.index - 1] : null;
            },
            next: function () {
              return this.index < this.siblings.length - 1 ? this.siblings[this.index + 1] : null;
            },
            isDirty: function () {
              return this.source.$parentNodesScope != this.parent || this.source.index() != this.index;
            },
            eventArgs: function (elements, pos) {
              return {
                source: this.sourceInfo,
                dest: {
                  index: this.index,
                  nodesScope: this.parent
                },
                elements: elements,
                pos: pos
              };
            },
            apply: function () {
              var nodeData = this.source.$modelValue;
              this.source.remove(), this.parent.insertNode(this.index, nodeData);
            }
          };
        },
        height: function (element) {
          return element.prop('scrollHeight');
        },
        width: function (element) {
          return element.prop('scrollWidth');
        },
        offset: function (element) {
          var boundingClientRect = element[0].getBoundingClientRect();
          return {
            width: element.prop('offsetWidth'),
            height: element.prop('offsetHeight'),
            top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
            left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
          };
        },
        positionStarted: function (e, target) {
          var pos = {};
          return pos.offsetX = e.pageX - this.offset(target).left, pos.offsetY = e.pageY - this.offset(target).top, pos.startX = pos.lastX = e.pageX, pos.startY = pos.lastY = e.pageY, pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0, pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0, pos;
        },
        positionMoved: function (e, pos, firstMoving) {
          pos.lastX = pos.nowX, pos.lastY = pos.nowY, pos.nowX = e.pageX, pos.nowY = e.pageY, pos.distX = pos.nowX - pos.lastX, pos.distY = pos.nowY - pos.lastY, pos.lastDirX = pos.dirX, pos.lastDirY = pos.dirY, pos.dirX = 0 === pos.distX ? 0 : pos.distX > 0 ? 1 : -1, pos.dirY = 0 === pos.distY ? 0 : pos.distY > 0 ? 1 : -1;
          var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;
          return firstMoving ? (pos.dirAx = newAx, void (pos.moving = !0)) : (pos.dirAx !== newAx ? (pos.distAxX = 0, pos.distAxY = 0) : (pos.distAxX += Math.abs(pos.distX), 0 !== pos.dirX && pos.dirX !== pos.lastDirX && (pos.distAxX = 0), pos.distAxY += Math.abs(pos.distY), 0 !== pos.dirY && pos.dirY !== pos.lastDirY && (pos.distAxY = 0)), void (pos.dirAx = newAx));
        }
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').controller('TreeController', [
    '$scope',
    '$element',
    '$attrs',
    'treeConfig',
    function ($scope, $element) {
      this.scope = $scope, $scope.$element = $element, $scope.$nodesScope = null, $scope.$type = 'uiTree', $scope.$emptyElm = null, $scope.$callbacks = null, $scope.dragEnabled = !0, $scope.emptyPlaceHolderEnabled = !0, $scope.maxDepth = 0, $scope.dragDelay = 0, $scope.isEmpty = function () {
        return $scope.$nodesScope && $scope.$nodesScope.$modelValue && 0 === $scope.$nodesScope.$modelValue.length;
      }, $scope.place = function (placeElm) {
        $scope.$nodesScope.$element.append(placeElm), $scope.$emptyElm.remove();
      }, $scope.resetEmptyElement = function () {
        0 === $scope.$nodesScope.$modelValue.length && $scope.emptyPlaceHolderEnabled ? $element.append($scope.$emptyElm) : $scope.$emptyElm.remove();
      };
      var collapseOrExpand = function (scope, collapsed) {
        for (var nodes = scope.childNodes(), i = 0; i < nodes.length; i++) {
          collapsed ? nodes[i].collapse() : nodes[i].expand();
          var subScope = nodes[i].$childNodesScope;
          subScope && collapseOrExpand(subScope, collapsed);
        }
      };
      $scope.collapseAll = function () {
        collapseOrExpand($scope.$nodesScope, !0);
      }, $scope.expandAll = function () {
        collapseOrExpand($scope.$nodesScope, !1);
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').controller('TreeNodesController', [
    '$scope',
    '$element',
    'treeConfig',
    function ($scope, $element) {
      this.scope = $scope, $scope.$element = $element, $scope.$modelValue = null, $scope.$nodeScope = null, $scope.$treeScope = null, $scope.$type = 'uiTreeNodes', $scope.$nodesMap = {}, $scope.nodrop = !1, $scope.maxDepth = 0, $scope.initSubNode = function (subNode) {
        $scope.$nodesMap[subNode.$modelValue.$$hashKey] = subNode;
      }, $scope.destroySubNode = function (subNode) {
        $scope.$nodesMap[subNode.$modelValue.$$hashKey] = null;
      }, $scope.accept = function (sourceNode, destIndex) {
        return $scope.$treeScope.$callbacks.accept(sourceNode, $scope, destIndex);
      }, $scope.beforeDrag = function (sourceNode) {
        return $scope.$treeScope.$callbacks.beforeDrag(sourceNode);
      }, $scope.isParent = function (node) {
        return node.$parentNodesScope == $scope;
      }, $scope.hasChild = function () {
        return $scope.$modelValue.length > 0;
      }, $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        '$apply' == phase || '$digest' == phase ? fn && 'function' == typeof fn && fn() : this.$apply(fn);
      }, $scope.removeNode = function (node) {
        var index = $scope.$modelValue.indexOf(node.$modelValue);
        return index > -1 ? ($scope.safeApply(function () {
          $scope.$modelValue.splice(index, 1)[0];
        }), node) : null;
      }, $scope.insertNode = function (index, nodeData) {
        $scope.safeApply(function () {
          $scope.$modelValue.splice(index, 0, nodeData);
        });
      }, $scope.childNodes = function () {
        var nodes = [];
        if ($scope.$modelValue)
          for (var i = 0; i < $scope.$modelValue.length; i++)
            nodes.push($scope.$nodesMap[$scope.$modelValue[i].$$hashKey]);
        return nodes;
      }, $scope.depth = function () {
        return $scope.$nodeScope ? $scope.$nodeScope.depth() : 0;
      }, $scope.outOfDepth = function (sourceNode) {
        var maxDepth = $scope.maxDepth || $scope.$treeScope.maxDepth;
        return maxDepth > 0 ? $scope.depth() + sourceNode.maxSubDepth() + 1 > maxDepth : !1;
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').controller('TreeNodeController', [
    '$scope',
    '$element',
    '$attrs',
    'treeConfig',
    function ($scope, $element) {
      this.scope = $scope, $scope.$element = $element, $scope.$modelValue = null, $scope.$parentNodeScope = null, $scope.$childNodesScope = null, $scope.$parentNodesScope = null, $scope.$treeScope = null, $scope.$handleScope = null, $scope.$type = 'uiTreeNode', $scope.$$apply = !1, $scope.collapsed = !1, $scope.init = function (controllersArr) {
        var treeNodesCtrl = controllersArr[0];
        $scope.$treeScope = controllersArr[1] ? controllersArr[1].scope : null, $scope.$parentNodeScope = treeNodesCtrl.scope.$nodeScope, $scope.$modelValue = treeNodesCtrl.scope.$modelValue[$scope.$index], $scope.$parentNodesScope = treeNodesCtrl.scope, treeNodesCtrl.scope.initSubNode($scope), $element.on('$destroy', function () {
          treeNodesCtrl.scope.destroySubNode($scope);
        });
      }, $scope.index = function () {
        return $scope.$parentNodesScope.$modelValue.indexOf($scope.$modelValue);
      }, $scope.dragEnabled = function () {
        return !($scope.$treeScope && !$scope.$treeScope.dragEnabled);
      }, $scope.isSibling = function (targetNode) {
        return $scope.$parentNodesScope == targetNode.$parentNodesScope;
      }, $scope.isChild = function (targetNode) {
        var nodes = $scope.childNodes();
        return nodes && nodes.indexOf(targetNode) > -1;
      }, $scope.prev = function () {
        var index = $scope.index();
        return index > 0 ? $scope.siblings()[index - 1] : null;
      }, $scope.siblings = function () {
        return $scope.$parentNodesScope.childNodes();
      }, $scope.childNodesCount = function () {
        return $scope.childNodes() ? $scope.childNodes().length : 0;
      }, $scope.hasChild = function () {
        return $scope.childNodesCount() > 0;
      }, $scope.childNodes = function () {
        return $scope.$childNodesScope && $scope.$childNodesScope.$modelValue ? $scope.$childNodesScope.childNodes() : null;
      }, $scope.accept = function (sourceNode, destIndex) {
        return $scope.$childNodesScope && $scope.$childNodesScope.$modelValue && $scope.$childNodesScope.accept(sourceNode, destIndex);
      }, $scope.removeNode = function () {
        var node = $scope.remove();
        return $scope.$callbacks.removed(node), node;
      }, $scope.remove = function () {
        return $scope.$parentNodesScope.removeNode($scope);
      }, $scope.toggle = function () {
        $scope.collapsed = !$scope.collapsed;
      }, $scope.collapse = function () {
        $scope.collapsed = !0;
      }, $scope.expand = function () {
        $scope.collapsed = !1;
      }, $scope.depth = function () {
        var parentNode = $scope.$parentNodeScope;
        return parentNode ? parentNode.depth() + 1 : 1;
      };
      var subDepth = 0, countSubDepth = function (scope) {
          for (var count = 0, nodes = scope.childNodes(), i = 0; i < nodes.length; i++) {
            var childNodes = nodes[i].$childNodesScope;
            childNodes && (count = 1, countSubDepth(childNodes));
          }
          subDepth += count;
        };
      $scope.maxSubDepth = function () {
        return subDepth = 0, $scope.$childNodesScope && countSubDepth($scope.$childNodesScope), subDepth;
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').controller('TreeHandleController', [
    '$scope',
    '$element',
    '$attrs',
    'treeConfig',
    function ($scope, $element) {
      this.scope = $scope, $scope.$element = $element, $scope.$nodeScope = null, $scope.$type = 'uiTreeHandle';
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').directive('uiTree', [
    'treeConfig',
    '$window',
    function (treeConfig, $window) {
      return {
        restrict: 'A',
        scope: !0,
        controller: 'TreeController',
        link: function (scope, element, attrs) {
          var callbacks = {
              accept: null,
              beforeDrag: null
            }, config = {};
          angular.extend(config, treeConfig), config.treeClass && element.addClass(config.treeClass), scope.$emptyElm = angular.element($window.document.createElement('div')), config.emptyTreeClass && scope.$emptyElm.addClass(config.emptyTreeClass), scope.$watch('$nodesScope.$modelValue.length', function () {
            scope.$nodesScope.$modelValue && scope.resetEmptyElement();
          }, !0), scope.$watch(attrs.dragEnabled, function (val) {
            'boolean' == typeof val && (scope.dragEnabled = val);
          }), scope.$watch(attrs.emptyPlaceHolderEnabled, function (val) {
            'boolean' == typeof val && (scope.emptyPlaceHolderEnabled = val);
          }), scope.$watch(attrs.maxDepth, function (val) {
            'number' == typeof val && (scope.maxDepth = val);
          }), scope.$watch(attrs.dragDelay, function (val) {
            'number' == typeof val && (scope.dragDelay = val);
          }), callbacks.accept = function (sourceNodeScope, destNodesScope) {
            return destNodesScope.nodrop || destNodesScope.outOfDepth(sourceNodeScope) ? !1 : !0;
          }, callbacks.beforeDrag = function () {
            return !0;
          }, callbacks.removed = function () {
          }, callbacks.dropped = function () {
          }, callbacks.dragStart = function () {
          }, callbacks.dragMove = function () {
          }, callbacks.dragStop = function () {
          }, callbacks.beforeDrop = function () {
          }, scope.$watch(attrs.uiTree, function (newVal) {
            angular.forEach(newVal, function (value, key) {
              callbacks[key] && 'function' == typeof value && (callbacks[key] = value);
            }), scope.$callbacks = callbacks;
          }, !0);
        }
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').directive('uiTreeNodes', [
    'treeConfig',
    '$window',
    function (treeConfig) {
      return {
        require: [
          'ngModel',
          '?^uiTreeNode',
          '^uiTree'
        ],
        restrict: 'A',
        scope: !0,
        controller: 'TreeNodesController',
        link: function (scope, element, attrs, controllersArr) {
          var config = {};
          angular.extend(config, treeConfig), config.nodesClass && element.addClass(config.nodesClass);
          var ngModel = controllersArr[0], treeNodeCtrl = controllersArr[1], treeCtrl = controllersArr[2];
          treeNodeCtrl ? (treeNodeCtrl.scope.$childNodesScope = scope, scope.$nodeScope = treeNodeCtrl.scope) : treeCtrl.scope.$nodesScope = scope, scope.$treeScope = treeCtrl.scope, ngModel && (ngModel.$render = function () {
            ngModel.$modelValue && angular.isArray(ngModel.$modelValue) || (scope.$modelValue = []), scope.$modelValue = ngModel.$modelValue;
          }), scope.$watch(attrs.maxDepth, function (val) {
            'number' == typeof val && (scope.maxDepth = val);
          }), attrs.$observe('nodrop', function (val) {
            scope.nodrop = 'undefined' != typeof val;
          }), attrs.$observe('horizontal', function (val) {
            scope.horizontal = 'undefined' != typeof val;
          });
        }
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').directive('uiTreeNode', [
    'treeConfig',
    '$uiTreeHelper',
    '$window',
    '$document',
    '$timeout',
    function (treeConfig, $uiTreeHelper, $window, $document, $timeout) {
      return {
        require: [
          '^uiTreeNodes',
          '^uiTree'
        ],
        restrict: 'A',
        controller: 'TreeNodeController',
        link: function (scope, element, attrs, controllersArr) {
          var config = {};
          angular.extend(config, treeConfig), config.nodeClass && element.addClass(config.nodeClass), scope.init(controllersArr), scope.collapsed = !!$uiTreeHelper.getNodeAttribute(scope, 'collapsed'), scope.$watch(attrs.collapsed, function (val) {
            'boolean' == typeof val && (scope.collapsed = val);
          }), scope.$watch('collapsed', function (val) {
            $uiTreeHelper.setNodeAttribute(scope, 'collapsed', val), attrs.$set('collapsed', val);
          });
          var firstMoving, dragInfo, pos, placeElm, hiddenPlaceElm, dragElm, elements, document_height, document_width, hasTouch = 'ontouchstart' in window, treeScope = null, dragDelaying = !0, dragStarted = !1, dragTimer = null, body = document.body, html = document.documentElement, dragStart = function (e) {
              if ((hasTouch || 2 != e.button && 3 != e.which) && !(e.uiTreeDragging || e.originalEvent && e.originalEvent.uiTreeDragging)) {
                var eventElm = angular.element(e.target), eventScope = eventElm.scope();
                if (eventScope && eventScope.$type && !('uiTreeNode' != eventScope.$type && 'uiTreeHandle' != eventScope.$type || 'uiTreeNode' == eventScope.$type && eventScope.$handleScope)) {
                  var eventElmTagName = eventElm.prop('tagName').toLowerCase();
                  if ('input' != eventElmTagName && 'textarea' != eventElmTagName && 'button' != eventElmTagName && 'select' != eventElmTagName) {
                    for (; eventElm && eventElm[0] && eventElm[0] != element;) {
                      if ($uiTreeHelper.nodrag(eventElm))
                        return;
                      eventElm = eventElm.parent();
                    }
                    if (scope.beforeDrag(scope)) {
                      e.uiTreeDragging = !0, e.originalEvent && (e.originalEvent.uiTreeDragging = !0), e.preventDefault();
                      var eventObj = $uiTreeHelper.eventObj(e);
                      firstMoving = !0, dragInfo = $uiTreeHelper.dragInfo(scope);
                      var tagName = scope.$element.prop('tagName');
                      if ('tr' === tagName.toLowerCase()) {
                        placeElm = angular.element($window.document.createElement(tagName));
                        var tdElm = angular.element($window.document.createElement('td')).addClass(config.placeHolderClass);
                        placeElm.append(tdElm);
                      } else
                        placeElm = angular.element($window.document.createElement(tagName)).addClass(config.placeHolderClass);
                      hiddenPlaceElm = angular.element($window.document.createElement(tagName)), config.hiddenClass && hiddenPlaceElm.addClass(config.hiddenClass), pos = $uiTreeHelper.positionStarted(eventObj, scope.$element), placeElm.css('height', $uiTreeHelper.height(scope.$element) + 'px'), placeElm.css('width', $uiTreeHelper.width(scope.$element) + 'px'), dragElm = angular.element($window.document.createElement(scope.$parentNodesScope.$element.prop('tagName'))).addClass(scope.$parentNodesScope.$element.attr('class')).addClass(config.dragClass), dragElm.css('width', $uiTreeHelper.width(scope.$element) + 'px'), dragElm.css('z-index', 9999);
                      var hStyle = (scope.$element[0].querySelector('.angular-ui-tree-handle') || scope.$element[0]).currentStyle;
                      hStyle && (document.body.setAttribute('ui-tree-cursor', $document.find('body').css('cursor') || ''), $document.find('body').css({ cursor: hStyle.cursor + '!important' })), scope.$element.after(placeElm), scope.$element.after(hiddenPlaceElm), dragElm.append(scope.$element), $document.find('body').append(dragElm), dragElm.css({
                        left: eventObj.pageX - pos.offsetX + 'px',
                        top: eventObj.pageY - pos.offsetY + 'px'
                      }), elements = {
                        placeholder: placeElm,
                        dragging: dragElm
                      }, angular.element($document).bind('touchend', dragEndEvent), angular.element($document).bind('touchcancel', dragEndEvent), angular.element($document).bind('touchmove', dragMoveEvent), angular.element($document).bind('mouseup', dragEndEvent), angular.element($document).bind('mousemove', dragMoveEvent), angular.element($document).bind('mouseleave', dragCancelEvent), document_height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight), document_width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
                    }
                  }
                }
              }
            }, dragMove = function (e) {
              if (!dragStarted)
                return void (dragDelaying || (dragStarted = !0, scope.$apply(function () {
                  scope.$callbacks.dragStart(dragInfo.eventArgs(elements, pos));
                })));
              var prev, leftElmPos, topElmPos, eventObj = $uiTreeHelper.eventObj(e);
              if (dragElm) {
                e.preventDefault(), $window.getSelection ? $window.getSelection().removeAllRanges() : $window.document.selection && $window.document.selection.empty(), leftElmPos = eventObj.pageX - pos.offsetX, topElmPos = eventObj.pageY - pos.offsetY, 0 > leftElmPos && (leftElmPos = 0), 0 > topElmPos && (topElmPos = 0), topElmPos + 10 > document_height && (topElmPos = document_height - 10), leftElmPos + 10 > document_width && (leftElmPos = document_width - 10), dragElm.css({
                  left: leftElmPos + 'px',
                  top: topElmPos + 'px'
                });
                var top_scroll = window.pageYOffset || $window.document.documentElement.scrollTop, bottom_scroll = top_scroll + (window.innerHeight || $window.document.clientHeight || $window.document.clientHeight);
                if (bottom_scroll < eventObj.pageY && document_height >= bottom_scroll && window.scrollBy(0, 10), top_scroll > eventObj.pageY && window.scrollBy(0, -10), $uiTreeHelper.positionMoved(e, pos, firstMoving), firstMoving)
                  return void (firstMoving = !1);
                if (pos.dirAx && pos.distAxX >= config.levelThreshold && (pos.distAxX = 0, pos.distX > 0 && (prev = dragInfo.prev(), prev && !prev.collapsed && prev.accept(scope, prev.childNodesCount()) && (prev.$childNodesScope.$element.append(placeElm), dragInfo.moveTo(prev.$childNodesScope, prev.childNodes(), prev.childNodesCount()))), pos.distX < 0)) {
                  var next = dragInfo.next();
                  if (!next) {
                    var target = dragInfo.parentNode();
                    target && target.$parentNodesScope.accept(scope, target.index() + 1) && (target.$element.after(placeElm), dragInfo.moveTo(target.$parentNodesScope, target.siblings(), target.index() + 1));
                  }
                }
                var displayElm, targetX = ($uiTreeHelper.offset(dragElm).left - $uiTreeHelper.offset(placeElm).left >= config.threshold, eventObj.pageX - $window.document.body.scrollLeft), targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);
                angular.isFunction(dragElm.hide) ? dragElm.hide() : (displayElm = dragElm[0].style.display, dragElm[0].style.display = 'none'), $window.document.elementFromPoint(targetX, targetY);
                var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));
                if (angular.isFunction(dragElm.show) ? dragElm.show() : dragElm[0].style.display = displayElm, !pos.dirAx) {
                  var targetBefore, targetNode;
                  targetNode = targetElm.scope();
                  var isEmpty = !1;
                  if (!targetNode)
                    return;
                  if ('uiTree' == targetNode.$type && targetNode.dragEnabled && (isEmpty = targetNode.isEmpty()), 'uiTreeHandle' == targetNode.$type && (targetNode = targetNode.$nodeScope), 'uiTreeNode' != targetNode.$type && !isEmpty)
                    return;
                  if (treeScope && placeElm.parent()[0] != treeScope.$element[0] && (treeScope.resetEmptyElement(), treeScope = null), isEmpty)
                    treeScope = targetNode, targetNode.$nodesScope.accept(scope, 0) && (targetNode.place(placeElm), dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.childNodes(), 0));
                  else if (targetNode.dragEnabled()) {
                    targetElm = targetNode.$element;
                    var targetOffset = $uiTreeHelper.offset(targetElm);
                    targetBefore = targetNode.horizontal ? eventObj.pageX < targetOffset.left + $uiTreeHelper.width(targetElm) / 2 : eventObj.pageY < targetOffset.top + $uiTreeHelper.height(targetElm) / 2, targetNode.$parentNodesScope.accept(scope, targetNode.index()) ? targetBefore ? (targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]), dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index())) : (targetElm.after(placeElm), dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index() + 1)) : !targetBefore && targetNode.accept(scope, targetNode.childNodesCount()) && (targetNode.$childNodesScope.$element.append(placeElm), dragInfo.moveTo(targetNode.$childNodesScope, targetNode.childNodes(), targetNode.childNodesCount()));
                  }
                }
                scope.$apply(function () {
                  scope.$callbacks.dragMove(dragInfo.eventArgs(elements, pos));
                });
              }
            }, dragEnd = function (e) {
              e.preventDefault(), dragElm && (scope.$treeScope.$apply(function () {
                scope.$callbacks.beforeDrop(dragInfo.eventArgs(elements, pos));
              }), hiddenPlaceElm.replaceWith(scope.$element), placeElm.remove(), dragElm.remove(), dragElm = null, scope.$$apply ? (dragInfo.apply(), scope.$treeScope.$apply(function () {
                scope.$callbacks.dropped(dragInfo.eventArgs(elements, pos));
              })) : bindDrag(), scope.$treeScope.$apply(function () {
                scope.$callbacks.dragStop(dragInfo.eventArgs(elements, pos));
              }), scope.$$apply = !1, dragInfo = null);
              var oldCur = document.body.getAttribute('ui-tree-cursor');
              null !== oldCur && ($document.find('body').css({ cursor: oldCur }), document.body.removeAttribute('ui-tree-cursor')), angular.element($document).unbind('touchend', dragEndEvent), angular.element($document).unbind('touchcancel', dragEndEvent), angular.element($document).unbind('touchmove', dragMoveEvent), angular.element($document).unbind('mouseup', dragEndEvent), angular.element($document).unbind('mousemove', dragMoveEvent), angular.element($window.document.body).unbind('mouseleave', dragCancelEvent);
            }, dragStartEvent = function (e) {
              scope.dragEnabled() && dragStart(e);
            }, dragMoveEvent = function (e) {
              dragMove(e);
            }, dragEndEvent = function (e) {
              scope.$$apply = !0, dragEnd(e);
            }, dragCancelEvent = function (e) {
              dragEnd(e);
            }, bindDrag = function () {
              element.bind('touchstart mousedown', function (e) {
                dragDelaying = !0, dragStarted = !1, dragStartEvent(e), dragTimer = $timeout(function () {
                  dragDelaying = !1;
                }, scope.dragDelay);
              }), element.bind('touchend touchcancel mouseup', function () {
                $timeout.cancel(dragTimer);
              });
            };
          bindDrag(), angular.element($window.document.body).bind('keydown', function (e) {
            27 == e.keyCode && (scope.$$apply = !1, dragEnd(e));
          });
        }
      };
    }
  ]);
}(), function () {
  'use strict';
  angular.module('ui.tree').directive('uiTreeHandle', [
    'treeConfig',
    '$window',
    function (treeConfig) {
      return {
        require: '^uiTreeNode',
        restrict: 'A',
        scope: !0,
        controller: 'TreeHandleController',
        link: function (scope, element, attrs, treeNodeCtrl) {
          var config = {};
          angular.extend(config, treeConfig), config.handleClass && element.addClass(config.handleClass), scope != treeNodeCtrl.scope && (scope.$nodeScope = treeNodeCtrl.scope, treeNodeCtrl.scope.$handleScope = scope);
        }
      };
    }
  ]);
}();
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.12.0 - 2014-11-16
 * License: MIT
 */
angular.module('ui.bootstrap', [
  'ui.bootstrap.tpls',
  'ui.bootstrap.transition',
  'ui.bootstrap.collapse',
  'ui.bootstrap.accordion',
  'ui.bootstrap.alert',
  'ui.bootstrap.bindHtml',
  'ui.bootstrap.buttons',
  'ui.bootstrap.carousel',
  'ui.bootstrap.dateparser',
  'ui.bootstrap.position',
  'ui.bootstrap.datepicker',
  'ui.bootstrap.dropdown',
  'ui.bootstrap.modal',
  'ui.bootstrap.pagination',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.popover',
  'ui.bootstrap.progressbar',
  'ui.bootstrap.rating',
  'ui.bootstrap.tabs',
  'ui.bootstrap.timepicker',
  'ui.bootstrap.typeahead'
]), angular.module('ui.bootstrap.tpls', [
  'template/accordion/accordion-group.html',
  'template/accordion/accordion.html',
  'template/alert/alert.html',
  'template/carousel/carousel.html',
  'template/carousel/slide.html',
  'template/datepicker/datepicker.html',
  'template/datepicker/day.html',
  'template/datepicker/month.html',
  'template/datepicker/popup.html',
  'template/datepicker/year.html',
  'template/modal/backdrop.html',
  'template/modal/window.html',
  'template/pagination/pager.html',
  'template/pagination/pagination.html',
  'template/tooltip/tooltip-html-unsafe-popup.html',
  'template/tooltip/tooltip-popup.html',
  'template/popover/popover.html',
  'template/progressbar/bar.html',
  'template/progressbar/progress.html',
  'template/progressbar/progressbar.html',
  'template/rating/rating.html',
  'template/tabs/tab.html',
  'template/tabs/tabset.html',
  'template/timepicker/timepicker.html',
  'template/typeahead/typeahead-match.html',
  'template/typeahead/typeahead-popup.html'
]), angular.module('ui.bootstrap.transition', []).factory('$transition', [
  '$q',
  '$timeout',
  '$rootScope',
  function (a, b, c) {
    function d(a) {
      for (var b in a)
        if (void 0 !== f.style[b])
          return a[b];
    }
    var e = function (d, f, g) {
        g = g || {};
        var h = a.defer(), i = e[g.animation ? 'animationEndEventName' : 'transitionEndEventName'], j = function () {
            c.$apply(function () {
              d.unbind(i, j), h.resolve(d);
            });
          };
        return i && d.bind(i, j), b(function () {
          angular.isString(f) ? d.addClass(f) : angular.isFunction(f) ? f(d) : angular.isObject(f) && d.css(f), i || h.resolve(d);
        }), h.promise.cancel = function () {
          i && d.unbind(i, j), h.reject('Transition cancelled');
        }, h.promise;
      }, f = document.createElement('trans'), g = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd',
        transition: 'transitionend'
      }, h = {
        WebkitTransition: 'webkitAnimationEnd',
        MozTransition: 'animationend',
        OTransition: 'oAnimationEnd',
        transition: 'animationend'
      };
    return e.transitionEndEventName = d(g), e.animationEndEventName = d(h), e;
  }
]), angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition']).directive('collapse', [
  '$transition',
  function (a) {
    return {
      link: function (b, c, d) {
        function e(b) {
          function d() {
            j === e && (j = void 0);
          }
          var e = a(c, b);
          return j && j.cancel(), j = e, e.then(d, d), e;
        }
        function f() {
          k ? (k = !1, g()) : (c.removeClass('collapse').addClass('collapsing'), e({ height: c[0].scrollHeight + 'px' }).then(g));
        }
        function g() {
          c.removeClass('collapsing'), c.addClass('collapse in'), c.css({ height: 'auto' });
        }
        function h() {
          if (k)
            k = !1, i(), c.css({ height: 0 });
          else {
            c.css({ height: c[0].scrollHeight + 'px' });
            {
              c[0].offsetWidth;
            }
            c.removeClass('collapse in').addClass('collapsing'), e({ height: 0 }).then(i);
          }
        }
        function i() {
          c.removeClass('collapsing'), c.addClass('collapse');
        }
        var j, k = !0;
        b.$watch(d.collapse, function (a) {
          a ? h() : f();
        });
      }
    };
  }
]), angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse']).constant('accordionConfig', { closeOthers: !0 }).controller('AccordionController', [
  '$scope',
  '$attrs',
  'accordionConfig',
  function (a, b, c) {
    this.groups = [], this.closeOthers = function (d) {
      var e = angular.isDefined(b.closeOthers) ? a.$eval(b.closeOthers) : c.closeOthers;
      e && angular.forEach(this.groups, function (a) {
        a !== d && (a.isOpen = !1);
      });
    }, this.addGroup = function (a) {
      var b = this;
      this.groups.push(a), a.$on('$destroy', function () {
        b.removeGroup(a);
      });
    }, this.removeGroup = function (a) {
      var b = this.groups.indexOf(a);
      -1 !== b && this.groups.splice(b, 1);
    };
  }
]).directive('accordion', function () {
  return {
    restrict: 'EA',
    controller: 'AccordionController',
    transclude: !0,
    replace: !1,
    templateUrl: 'template/accordion/accordion.html'
  };
}).directive('accordionGroup', function () {
  return {
    require: '^accordion',
    restrict: 'EA',
    transclude: !0,
    replace: !0,
    templateUrl: 'template/accordion/accordion-group.html',
    scope: {
      heading: '@',
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function () {
      this.setHeading = function (a) {
        this.heading = a;
      };
    },
    link: function (a, b, c, d) {
      d.addGroup(a), a.$watch('isOpen', function (b) {
        b && d.closeOthers(a);
      }), a.toggleOpen = function () {
        a.isDisabled || (a.isOpen = !a.isOpen);
      };
    }
  };
}).directive('accordionHeading', function () {
  return {
    restrict: 'EA',
    transclude: !0,
    template: '',
    replace: !0,
    require: '^accordionGroup',
    link: function (a, b, c, d, e) {
      d.setHeading(e(a, function () {
      }));
    }
  };
}).directive('accordionTransclude', function () {
  return {
    require: '^accordionGroup',
    link: function (a, b, c, d) {
      a.$watch(function () {
        return d[c.accordionTransclude];
      }, function (a) {
        a && (b.html(''), b.append(a));
      });
    }
  };
}), angular.module('ui.bootstrap.alert', []).controller('AlertController', [
  '$scope',
  '$attrs',
  function (a, b) {
    a.closeable = 'close' in b, this.close = a.close;
  }
]).directive('alert', function () {
  return {
    restrict: 'EA',
    controller: 'AlertController',
    templateUrl: 'template/alert/alert.html',
    transclude: !0,
    replace: !0,
    scope: {
      type: '@',
      close: '&'
    }
  };
}).directive('dismissOnTimeout', [
  '$timeout',
  function (a) {
    return {
      require: 'alert',
      link: function (b, c, d, e) {
        a(function () {
          e.close();
        }, parseInt(d.dismissOnTimeout, 10));
      }
    };
  }
]), angular.module('ui.bootstrap.bindHtml', []).directive('bindHtmlUnsafe', function () {
  return function (a, b, c) {
    b.addClass('ng-binding').data('$binding', c.bindHtmlUnsafe), a.$watch(c.bindHtmlUnsafe, function (a) {
      b.html(a || '');
    });
  };
}), angular.module('ui.bootstrap.buttons', []).constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
}).controller('ButtonsController', [
  'buttonConfig',
  function (a) {
    this.activeClass = a.activeClass || 'active', this.toggleEvent = a.toggleEvent || 'click';
  }
]).directive('btnRadio', function () {
  return {
    require: [
      'btnRadio',
      'ngModel'
    ],
    controller: 'ButtonsController',
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f.$render = function () {
        b.toggleClass(e.activeClass, angular.equals(f.$modelValue, a.$eval(c.btnRadio)));
      }, b.bind(e.toggleEvent, function () {
        var d = b.hasClass(e.activeClass);
        (!d || angular.isDefined(c.uncheckable)) && a.$apply(function () {
          f.$setViewValue(d ? null : a.$eval(c.btnRadio)), f.$render();
        });
      });
    }
  };
}).directive('btnCheckbox', function () {
  return {
    require: [
      'btnCheckbox',
      'ngModel'
    ],
    controller: 'ButtonsController',
    link: function (a, b, c, d) {
      function e() {
        return g(c.btnCheckboxTrue, !0);
      }
      function f() {
        return g(c.btnCheckboxFalse, !1);
      }
      function g(b, c) {
        var d = a.$eval(b);
        return angular.isDefined(d) ? d : c;
      }
      var h = d[0], i = d[1];
      i.$render = function () {
        b.toggleClass(h.activeClass, angular.equals(i.$modelValue, e()));
      }, b.bind(h.toggleEvent, function () {
        a.$apply(function () {
          i.$setViewValue(b.hasClass(h.activeClass) ? f() : e()), i.$render();
        });
      });
    }
  };
}), angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']).controller('CarouselController', [
  '$scope',
  '$timeout',
  '$interval',
  '$transition',
  function (a, b, c, d) {
    function e() {
      f();
      var b = +a.interval;
      !isNaN(b) && b > 0 && (h = c(g, b));
    }
    function f() {
      h && (c.cancel(h), h = null);
    }
    function g() {
      var b = +a.interval;
      i && !isNaN(b) && b > 0 ? a.next() : a.pause();
    }
    var h, i, j = this, k = j.slides = a.slides = [], l = -1;
    j.currentSlide = null;
    var m = !1;
    j.select = a.select = function (c, f) {
      function g() {
        if (!m) {
          if (j.currentSlide && angular.isString(f) && !a.noTransition && c.$element) {
            c.$element.addClass(f);
            {
              c.$element[0].offsetWidth;
            }
            angular.forEach(k, function (a) {
              angular.extend(a, {
                direction: '',
                entering: !1,
                leaving: !1,
                active: !1
              });
            }), angular.extend(c, {
              direction: f,
              active: !0,
              entering: !0
            }), angular.extend(j.currentSlide || {}, {
              direction: f,
              leaving: !0
            }), a.$currentTransition = d(c.$element, {}), function (b, c) {
              a.$currentTransition.then(function () {
                h(b, c);
              }, function () {
                h(b, c);
              });
            }(c, j.currentSlide);
          } else
            h(c, j.currentSlide);
          j.currentSlide = c, l = i, e();
        }
      }
      function h(b, c) {
        angular.extend(b, {
          direction: '',
          active: !0,
          leaving: !1,
          entering: !1
        }), angular.extend(c || {}, {
          direction: '',
          active: !1,
          leaving: !1,
          entering: !1
        }), a.$currentTransition = null;
      }
      var i = k.indexOf(c);
      void 0 === f && (f = i > l ? 'next' : 'prev'), c && c !== j.currentSlide && (a.$currentTransition ? (a.$currentTransition.cancel(), b(g)) : g());
    }, a.$on('$destroy', function () {
      m = !0;
    }), j.indexOfSlide = function (a) {
      return k.indexOf(a);
    }, a.next = function () {
      var b = (l + 1) % k.length;
      return a.$currentTransition ? void 0 : j.select(k[b], 'next');
    }, a.prev = function () {
      var b = 0 > l - 1 ? k.length - 1 : l - 1;
      return a.$currentTransition ? void 0 : j.select(k[b], 'prev');
    }, a.isActive = function (a) {
      return j.currentSlide === a;
    }, a.$watch('interval', e), a.$on('$destroy', f), a.play = function () {
      i || (i = !0, e());
    }, a.pause = function () {
      a.noPause || (i = !1, f());
    }, j.addSlide = function (b, c) {
      b.$element = c, k.push(b), 1 === k.length || b.active ? (j.select(k[k.length - 1]), 1 == k.length && a.play()) : b.active = !1;
    }, j.removeSlide = function (a) {
      var b = k.indexOf(a);
      k.splice(b, 1), k.length > 0 && a.active ? j.select(b >= k.length ? k[b - 1] : k[b]) : l > b && l--;
    };
  }
]).directive('carousel', [function () {
    return {
      restrict: 'EA',
      transclude: !0,
      replace: !0,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }]).directive('slide', function () {
  return {
    require: '^carousel',
    restrict: 'EA',
    transclude: !0,
    replace: !0,
    templateUrl: 'template/carousel/slide.html',
    scope: { active: '=?' },
    link: function (a, b, c, d) {
      d.addSlide(a, b), a.$on('$destroy', function () {
        d.removeSlide(a);
      }), a.$watch('active', function (b) {
        b && d.select(a);
      });
    }
  };
}), angular.module('ui.bootstrap.dateparser', []).service('dateParser', [
  '$locale',
  'orderByFilter',
  function (a, b) {
    function c(a) {
      var c = [], d = a.split('');
      return angular.forEach(e, function (b, e) {
        var f = a.indexOf(e);
        if (f > -1) {
          a = a.split(''), d[f] = '(' + b.regex + ')', a[f] = '$';
          for (var g = f + 1, h = f + e.length; h > g; g++)
            d[g] = '', a[g] = '$';
          a = a.join(''), c.push({
            index: f,
            apply: b.apply
          });
        }
      }), {
        regex: new RegExp('^' + d.join('') + '$'),
        map: b(c, 'index')
      };
    }
    function d(a, b, c) {
      return 1 === b && c > 28 ? 29 === c && (a % 4 === 0 && a % 100 !== 0 || a % 400 === 0) : 3 === b || 5 === b || 8 === b || 10 === b ? 31 > c : !0;
    }
    this.parsers = {};
    var e = {
        yyyy: {
          regex: '\\d{4}',
          apply: function (a) {
            this.year = +a;
          }
        },
        yy: {
          regex: '\\d{2}',
          apply: function (a) {
            this.year = +a + 2000;
          }
        },
        y: {
          regex: '\\d{1,4}',
          apply: function (a) {
            this.year = +a;
          }
        },
        MMMM: {
          regex: a.DATETIME_FORMATS.MONTH.join('|'),
          apply: function (b) {
            this.month = a.DATETIME_FORMATS.MONTH.indexOf(b);
          }
        },
        MMM: {
          regex: a.DATETIME_FORMATS.SHORTMONTH.join('|'),
          apply: function (b) {
            this.month = a.DATETIME_FORMATS.SHORTMONTH.indexOf(b);
          }
        },
        MM: {
          regex: '0[1-9]|1[0-2]',
          apply: function (a) {
            this.month = a - 1;
          }
        },
        M: {
          regex: '[1-9]|1[0-2]',
          apply: function (a) {
            this.month = a - 1;
          }
        },
        dd: {
          regex: '[0-2][0-9]{1}|3[0-1]{1}',
          apply: function (a) {
            this.date = +a;
          }
        },
        d: {
          regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
          apply: function (a) {
            this.date = +a;
          }
        },
        EEEE: { regex: a.DATETIME_FORMATS.DAY.join('|') },
        EEE: { regex: a.DATETIME_FORMATS.SHORTDAY.join('|') }
      };
    this.parse = function (b, e) {
      if (!angular.isString(b) || !e)
        return b;
      e = a.DATETIME_FORMATS[e] || e, this.parsers[e] || (this.parsers[e] = c(e));
      var f = this.parsers[e], g = f.regex, h = f.map, i = b.match(g);
      if (i && i.length) {
        for (var j, k = {
              year: 1900,
              month: 0,
              date: 1,
              hours: 0
            }, l = 1, m = i.length; m > l; l++) {
          var n = h[l - 1];
          n.apply && n.apply.call(k, i[l]);
        }
        return d(k.year, k.month, k.date) && (j = new Date(k.year, k.month, k.date, k.hours)), j;
      }
    };
  }
]), angular.module('ui.bootstrap.position', []).factory('$position', [
  '$document',
  '$window',
  function (a, b) {
    function c(a, c) {
      return a.currentStyle ? a.currentStyle[c] : b.getComputedStyle ? b.getComputedStyle(a)[c] : a.style[c];
    }
    function d(a) {
      return 'static' === (c(a, 'position') || 'static');
    }
    var e = function (b) {
      for (var c = a[0], e = b.offsetParent || c; e && e !== c && d(e);)
        e = e.offsetParent;
      return e || c;
    };
    return {
      position: function (b) {
        var c = this.offset(b), d = {
            top: 0,
            left: 0
          }, f = e(b[0]);
        f != a[0] && (d = this.offset(angular.element(f)), d.top += f.clientTop - f.scrollTop, d.left += f.clientLeft - f.scrollLeft);
        var g = b[0].getBoundingClientRect();
        return {
          width: g.width || b.prop('offsetWidth'),
          height: g.height || b.prop('offsetHeight'),
          top: c.top - d.top,
          left: c.left - d.left
        };
      },
      offset: function (c) {
        var d = c[0].getBoundingClientRect();
        return {
          width: d.width || c.prop('offsetWidth'),
          height: d.height || c.prop('offsetHeight'),
          top: d.top + (b.pageYOffset || a[0].documentElement.scrollTop),
          left: d.left + (b.pageXOffset || a[0].documentElement.scrollLeft)
        };
      },
      positionElements: function (a, b, c, d) {
        var e, f, g, h, i = c.split('-'), j = i[0], k = i[1] || 'center';
        e = d ? this.offset(a) : this.position(a), f = b.prop('offsetWidth'), g = b.prop('offsetHeight');
        var l = {
            center: function () {
              return e.left + e.width / 2 - f / 2;
            },
            left: function () {
              return e.left;
            },
            right: function () {
              return e.left + e.width;
            }
          }, m = {
            center: function () {
              return e.top + e.height / 2 - g / 2;
            },
            top: function () {
              return e.top;
            },
            bottom: function () {
              return e.top + e.height;
            }
          };
        switch (j) {
        case 'right':
          h = {
            top: m[k](),
            left: l[j]()
          };
          break;
        case 'left':
          h = {
            top: m[k](),
            left: e.left - f
          };
          break;
        case 'bottom':
          h = {
            top: m[j](),
            left: l[k]()
          };
          break;
        default:
          h = {
            top: e.top - g,
            left: l[k]()
          };
        }
        return h;
      }
    };
  }
]), angular.module('ui.bootstrap.datepicker', [
  'ui.bootstrap.dateparser',
  'ui.bootstrap.position'
]).constant('datepickerConfig', {
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  datepickerMode: 'day',
  minMode: 'day',
  maxMode: 'year',
  showWeeks: !0,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
}).controller('DatepickerController', [
  '$scope',
  '$attrs',
  '$parse',
  '$interpolate',
  '$timeout',
  '$log',
  'dateFilter',
  'datepickerConfig',
  function (a, b, c, d, e, f, g, h) {
    var i = this, j = { $setViewValue: angular.noop };
    this.modes = [
      'day',
      'month',
      'year'
    ], angular.forEach([
      'formatDay',
      'formatMonth',
      'formatYear',
      'formatDayHeader',
      'formatDayTitle',
      'formatMonthTitle',
      'minMode',
      'maxMode',
      'showWeeks',
      'startingDay',
      'yearRange'
    ], function (c, e) {
      i[c] = angular.isDefined(b[c]) ? 8 > e ? d(b[c])(a.$parent) : a.$parent.$eval(b[c]) : h[c];
    }), angular.forEach([
      'minDate',
      'maxDate'
    ], function (d) {
      b[d] ? a.$parent.$watch(c(b[d]), function (a) {
        i[d] = a ? new Date(a) : null, i.refreshView();
      }) : i[d] = h[d] ? new Date(h[d]) : null;
    }), a.datepickerMode = a.datepickerMode || h.datepickerMode, a.uniqueId = 'datepicker-' + a.$id + '-' + Math.floor(10000 * Math.random()), this.activeDate = angular.isDefined(b.initDate) ? a.$parent.$eval(b.initDate) : new Date(), a.isActive = function (b) {
      return 0 === i.compare(b.date, i.activeDate) ? (a.activeDateId = b.uid, !0) : !1;
    }, this.init = function (a) {
      j = a, j.$render = function () {
        i.render();
      };
    }, this.render = function () {
      if (j.$modelValue) {
        var a = new Date(j.$modelValue), b = !isNaN(a);
        b ? this.activeDate = a : f.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'), j.$setValidity('date', b);
      }
      this.refreshView();
    }, this.refreshView = function () {
      if (this.element) {
        this._refreshView();
        var a = j.$modelValue ? new Date(j.$modelValue) : null;
        j.$setValidity('date-disabled', !a || this.element && !this.isDisabled(a));
      }
    }, this.createDateObject = function (a, b) {
      var c = j.$modelValue ? new Date(j.$modelValue) : null;
      return {
        date: a,
        label: g(a, b),
        selected: c && 0 === this.compare(a, c),
        disabled: this.isDisabled(a),
        current: 0 === this.compare(a, new Date())
      };
    }, this.isDisabled = function (c) {
      return this.minDate && this.compare(c, this.minDate) < 0 || this.maxDate && this.compare(c, this.maxDate) > 0 || b.dateDisabled && a.dateDisabled({
        date: c,
        mode: a.datepickerMode
      });
    }, this.split = function (a, b) {
      for (var c = []; a.length > 0;)
        c.push(a.splice(0, b));
      return c;
    }, a.select = function (b) {
      if (a.datepickerMode === i.minMode) {
        var c = j.$modelValue ? new Date(j.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
        c.setFullYear(b.getFullYear(), b.getMonth(), b.getDate()), j.$setViewValue(c), j.$render();
      } else
        i.activeDate = b, a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) - 1];
    }, a.move = function (a) {
      var b = i.activeDate.getFullYear() + a * (i.step.years || 0), c = i.activeDate.getMonth() + a * (i.step.months || 0);
      i.activeDate.setFullYear(b, c, 1), i.refreshView();
    }, a.toggleMode = function (b) {
      b = b || 1, a.datepickerMode === i.maxMode && 1 === b || a.datepickerMode === i.minMode && -1 === b || (a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) + b]);
    }, a.keys = {
      13: 'enter',
      32: 'space',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
    var k = function () {
      e(function () {
        i.element[0].focus();
      }, 0, !1);
    };
    a.$on('datepicker.focus', k), a.keydown = function (b) {
      var c = a.keys[b.which];
      if (c && !b.shiftKey && !b.altKey)
        if (b.preventDefault(), b.stopPropagation(), 'enter' === c || 'space' === c) {
          if (i.isDisabled(i.activeDate))
            return;
          a.select(i.activeDate), k();
        } else
          !b.ctrlKey || 'up' !== c && 'down' !== c ? (i.handleKeyDown(c, b), i.refreshView()) : (a.toggleMode('up' === c ? 1 : -1), k());
    };
  }
]).directive('datepicker', function () {
  return {
    restrict: 'EA',
    replace: !0,
    templateUrl: 'template/datepicker/datepicker.html',
    scope: {
      datepickerMode: '=?',
      dateDisabled: '&'
    },
    require: [
      'datepicker',
      '?^ngModel'
    ],
    controller: 'DatepickerController',
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f && e.init(f);
    }
  };
}).directive('daypicker', [
  'dateFilter',
  function (a) {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/datepicker/day.html',
      require: '^datepicker',
      link: function (b, c, d, e) {
        function f(a, b) {
          return 1 !== b || a % 4 !== 0 || a % 100 === 0 && a % 400 !== 0 ? i[b] : 29;
        }
        function g(a, b) {
          var c = new Array(b), d = new Date(a), e = 0;
          for (d.setHours(12); b > e;)
            c[e++] = new Date(d), d.setDate(d.getDate() + 1);
          return c;
        }
        function h(a) {
          var b = new Date(a);
          b.setDate(b.getDate() + 4 - (b.getDay() || 7));
          var c = b.getTime();
          return b.setMonth(0), b.setDate(1), Math.floor(Math.round((c - b) / 86400000) / 7) + 1;
        }
        b.showWeeks = e.showWeeks, e.step = { months: 1 }, e.element = c;
        var i = [
            31,
            28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31
          ];
        e._refreshView = function () {
          var c = e.activeDate.getFullYear(), d = e.activeDate.getMonth(), f = new Date(c, d, 1), i = e.startingDay - f.getDay(), j = i > 0 ? 7 - i : -i, k = new Date(f);
          j > 0 && k.setDate(-j + 1);
          for (var l = g(k, 42), m = 0; 42 > m; m++)
            l[m] = angular.extend(e.createDateObject(l[m], e.formatDay), {
              secondary: l[m].getMonth() !== d,
              uid: b.uniqueId + '-' + m
            });
          b.labels = new Array(7);
          for (var n = 0; 7 > n; n++)
            b.labels[n] = {
              abbr: a(l[n].date, e.formatDayHeader),
              full: a(l[n].date, 'EEEE')
            };
          if (b.title = a(e.activeDate, e.formatDayTitle), b.rows = e.split(l, 7), b.showWeeks) {
            b.weekNumbers = [];
            for (var o = h(b.rows[0][0].date), p = b.rows.length; b.weekNumbers.push(o++) < p;);
          }
        }, e.compare = function (a, b) {
          return new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate());
        }, e.handleKeyDown = function (a) {
          var b = e.activeDate.getDate();
          if ('left' === a)
            b -= 1;
          else if ('up' === a)
            b -= 7;
          else if ('right' === a)
            b += 1;
          else if ('down' === a)
            b += 7;
          else if ('pageup' === a || 'pagedown' === a) {
            var c = e.activeDate.getMonth() + ('pageup' === a ? -1 : 1);
            e.activeDate.setMonth(c, 1), b = Math.min(f(e.activeDate.getFullYear(), e.activeDate.getMonth()), b);
          } else
            'home' === a ? b = 1 : 'end' === a && (b = f(e.activeDate.getFullYear(), e.activeDate.getMonth()));
          e.activeDate.setDate(b);
        }, e.refreshView();
      }
    };
  }
]).directive('monthpicker', [
  'dateFilter',
  function (a) {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/datepicker/month.html',
      require: '^datepicker',
      link: function (b, c, d, e) {
        e.step = { years: 1 }, e.element = c, e._refreshView = function () {
          for (var c = new Array(12), d = e.activeDate.getFullYear(), f = 0; 12 > f; f++)
            c[f] = angular.extend(e.createDateObject(new Date(d, f, 1), e.formatMonth), { uid: b.uniqueId + '-' + f });
          b.title = a(e.activeDate, e.formatMonthTitle), b.rows = e.split(c, 3);
        }, e.compare = function (a, b) {
          return new Date(a.getFullYear(), a.getMonth()) - new Date(b.getFullYear(), b.getMonth());
        }, e.handleKeyDown = function (a) {
          var b = e.activeDate.getMonth();
          if ('left' === a)
            b -= 1;
          else if ('up' === a)
            b -= 3;
          else if ('right' === a)
            b += 1;
          else if ('down' === a)
            b += 3;
          else if ('pageup' === a || 'pagedown' === a) {
            var c = e.activeDate.getFullYear() + ('pageup' === a ? -1 : 1);
            e.activeDate.setFullYear(c);
          } else
            'home' === a ? b = 0 : 'end' === a && (b = 11);
          e.activeDate.setMonth(b);
        }, e.refreshView();
      }
    };
  }
]).directive('yearpicker', [
  'dateFilter',
  function () {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/datepicker/year.html',
      require: '^datepicker',
      link: function (a, b, c, d) {
        function e(a) {
          return parseInt((a - 1) / f, 10) * f + 1;
        }
        var f = d.yearRange;
        d.step = { years: f }, d.element = b, d._refreshView = function () {
          for (var b = new Array(f), c = 0, g = e(d.activeDate.getFullYear()); f > c; c++)
            b[c] = angular.extend(d.createDateObject(new Date(g + c, 0, 1), d.formatYear), { uid: a.uniqueId + '-' + c });
          a.title = [
            b[0].label,
            b[f - 1].label
          ].join(' - '), a.rows = d.split(b, 5);
        }, d.compare = function (a, b) {
          return a.getFullYear() - b.getFullYear();
        }, d.handleKeyDown = function (a) {
          var b = d.activeDate.getFullYear();
          'left' === a ? b -= 1 : 'up' === a ? b -= 5 : 'right' === a ? b += 1 : 'down' === a ? b += 5 : 'pageup' === a || 'pagedown' === a ? b += ('pageup' === a ? -1 : 1) * d.step.years : 'home' === a ? b = e(d.activeDate.getFullYear()) : 'end' === a && (b = e(d.activeDate.getFullYear()) + f - 1), d.activeDate.setFullYear(b);
        }, d.refreshView();
      }
    };
  }
]).constant('datepickerPopupConfig', {
  datepickerPopup: 'yyyy-MM-dd',
  currentText: 'Today',
  clearText: 'Clear',
  closeText: 'Done',
  closeOnDateSelection: !0,
  appendToBody: !1,
  showButtonBar: !0
}).directive('datepickerPopup', [
  '$compile',
  '$parse',
  '$document',
  '$position',
  'dateFilter',
  'dateParser',
  'datepickerPopupConfig',
  function (a, b, c, d, e, f, g) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: {
        isOpen: '=?',
        currentText: '@',
        clearText: '@',
        closeText: '@',
        dateDisabled: '&'
      },
      link: function (h, i, j, k) {
        function l(a) {
          return a.replace(/([A-Z])/g, function (a) {
            return '-' + a.toLowerCase();
          });
        }
        function m(a) {
          if (a) {
            if (angular.isDate(a) && !isNaN(a))
              return k.$setValidity('date', !0), a;
            if (angular.isString(a)) {
              var b = f.parse(a, n) || new Date(a);
              return isNaN(b) ? void k.$setValidity('date', !1) : (k.$setValidity('date', !0), b);
            }
            return void k.$setValidity('date', !1);
          }
          return k.$setValidity('date', !0), null;
        }
        var n, o = angular.isDefined(j.closeOnDateSelection) ? h.$parent.$eval(j.closeOnDateSelection) : g.closeOnDateSelection, p = angular.isDefined(j.datepickerAppendToBody) ? h.$parent.$eval(j.datepickerAppendToBody) : g.appendToBody;
        h.showButtonBar = angular.isDefined(j.showButtonBar) ? h.$parent.$eval(j.showButtonBar) : g.showButtonBar, h.getText = function (a) {
          return h[a + 'Text'] || g[a + 'Text'];
        }, j.$observe('datepickerPopup', function (a) {
          n = a || g.datepickerPopup, k.$render();
        });
        var q = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
        q.attr({
          'ng-model': 'date',
          'ng-change': 'dateSelection()'
        });
        var r = angular.element(q.children()[0]);
        j.datepickerOptions && angular.forEach(h.$parent.$eval(j.datepickerOptions), function (a, b) {
          r.attr(l(b), a);
        }), h.watchData = {}, angular.forEach([
          'minDate',
          'maxDate',
          'datepickerMode'
        ], function (a) {
          if (j[a]) {
            var c = b(j[a]);
            if (h.$parent.$watch(c, function (b) {
                h.watchData[a] = b;
              }), r.attr(l(a), 'watchData.' + a), 'datepickerMode' === a) {
              var d = c.assign;
              h.$watch('watchData.' + a, function (a, b) {
                a !== b && d(h.$parent, a);
              });
            }
          }
        }), j.dateDisabled && r.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })'), k.$parsers.unshift(m), h.dateSelection = function (a) {
          angular.isDefined(a) && (h.date = a), k.$setViewValue(h.date), k.$render(), o && (h.isOpen = !1, i[0].focus());
        }, i.bind('input change keyup', function () {
          h.$apply(function () {
            h.date = k.$modelValue;
          });
        }), k.$render = function () {
          var a = k.$viewValue ? e(k.$viewValue, n) : '';
          i.val(a), h.date = m(k.$modelValue);
        };
        var s = function (a) {
            h.isOpen && a.target !== i[0] && h.$apply(function () {
              h.isOpen = !1;
            });
          }, t = function (a) {
            h.keydown(a);
          };
        i.bind('keydown', t), h.keydown = function (a) {
          27 === a.which ? (a.preventDefault(), a.stopPropagation(), h.close()) : 40 !== a.which || h.isOpen || (h.isOpen = !0);
        }, h.$watch('isOpen', function (a) {
          a ? (h.$broadcast('datepicker.focus'), h.position = p ? d.offset(i) : d.position(i), h.position.top = h.position.top + i.prop('offsetHeight'), c.bind('click', s)) : c.unbind('click', s);
        }), h.select = function (a) {
          if ('today' === a) {
            var b = new Date();
            angular.isDate(k.$modelValue) ? (a = new Date(k.$modelValue), a.setFullYear(b.getFullYear(), b.getMonth(), b.getDate())) : a = new Date(b.setHours(0, 0, 0, 0));
          }
          h.dateSelection(a);
        }, h.close = function () {
          h.isOpen = !1, i[0].focus();
        };
        var u = a(q)(h);
        q.remove(), p ? c.find('body').append(u) : i.after(u), h.$on('$destroy', function () {
          u.remove(), i.unbind('keydown', t), c.unbind('click', s);
        });
      }
    };
  }
]).directive('datepickerPopupWrap', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    templateUrl: 'template/datepicker/popup.html',
    link: function (a, b) {
      b.bind('click', function (a) {
        a.preventDefault(), a.stopPropagation();
      });
    }
  };
}), angular.module('ui.bootstrap.dropdown', []).constant('dropdownConfig', { openClass: 'open' }).service('dropdownService', [
  '$document',
  function (a) {
    var b = null;
    this.open = function (e) {
      b || (a.bind('click', c), a.bind('keydown', d)), b && b !== e && (b.isOpen = !1), b = e;
    }, this.close = function (e) {
      b === e && (b = null, a.unbind('click', c), a.unbind('keydown', d));
    };
    var c = function (a) {
        if (b) {
          var c = b.getToggleElement();
          a && c && c[0].contains(a.target) || b.$apply(function () {
            b.isOpen = !1;
          });
        }
      }, d = function (a) {
        27 === a.which && (b.focusToggleElement(), c());
      };
  }
]).controller('DropdownController', [
  '$scope',
  '$attrs',
  '$parse',
  'dropdownConfig',
  'dropdownService',
  '$animate',
  function (a, b, c, d, e, f) {
    var g, h = this, i = a.$new(), j = d.openClass, k = angular.noop, l = b.onToggle ? c(b.onToggle) : angular.noop;
    this.init = function (d) {
      h.$element = d, b.isOpen && (g = c(b.isOpen), k = g.assign, a.$watch(g, function (a) {
        i.isOpen = !!a;
      }));
    }, this.toggle = function (a) {
      return i.isOpen = arguments.length ? !!a : !i.isOpen;
    }, this.isOpen = function () {
      return i.isOpen;
    }, i.getToggleElement = function () {
      return h.toggleElement;
    }, i.focusToggleElement = function () {
      h.toggleElement && h.toggleElement[0].focus();
    }, i.$watch('isOpen', function (b, c) {
      f[b ? 'addClass' : 'removeClass'](h.$element, j), b ? (i.focusToggleElement(), e.open(i)) : e.close(i), k(a, b), angular.isDefined(b) && b !== c && l(a, { open: !!b });
    }), a.$on('$locationChangeSuccess', function () {
      i.isOpen = !1;
    }), a.$on('$destroy', function () {
      i.$destroy();
    });
  }
]).directive('dropdown', function () {
  return {
    controller: 'DropdownController',
    link: function (a, b, c, d) {
      d.init(b);
    }
  };
}).directive('dropdownToggle', function () {
  return {
    require: '?^dropdown',
    link: function (a, b, c, d) {
      if (d) {
        d.toggleElement = b;
        var e = function (e) {
          e.preventDefault(), b.hasClass('disabled') || c.disabled || a.$apply(function () {
            d.toggle();
          });
        };
        b.bind('click', e), b.attr({
          'aria-haspopup': !0,
          'aria-expanded': !1
        }), a.$watch(d.isOpen, function (a) {
          b.attr('aria-expanded', !!a);
        }), a.$on('$destroy', function () {
          b.unbind('click', e);
        });
      }
    }
  };
}), angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition']).factory('$$stackedMap', function () {
  return {
    createNew: function () {
      var a = [];
      return {
        add: function (b, c) {
          a.push({
            key: b,
            value: c
          });
        },
        get: function (b) {
          for (var c = 0; c < a.length; c++)
            if (b == a[c].key)
              return a[c];
        },
        keys: function () {
          for (var b = [], c = 0; c < a.length; c++)
            b.push(a[c].key);
          return b;
        },
        top: function () {
          return a[a.length - 1];
        },
        remove: function (b) {
          for (var c = -1, d = 0; d < a.length; d++)
            if (b == a[d].key) {
              c = d;
              break;
            }
          return a.splice(c, 1)[0];
        },
        removeTop: function () {
          return a.splice(a.length - 1, 1)[0];
        },
        length: function () {
          return a.length;
        }
      };
    }
  };
}).directive('modalBackdrop', [
  '$timeout',
  function (a) {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/modal/backdrop.html',
      link: function (b, c, d) {
        b.backdropClass = d.backdropClass || '', b.animate = !1, a(function () {
          b.animate = !0;
        });
      }
    };
  }
]).directive('modalWindow', [
  '$modalStack',
  '$timeout',
  function (a, b) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: !0,
      transclude: !0,
      templateUrl: function (a, b) {
        return b.templateUrl || 'template/modal/window.html';
      },
      link: function (c, d, e) {
        d.addClass(e.windowClass || ''), c.size = e.size, b(function () {
          c.animate = !0, d[0].querySelectorAll('[autofocus]').length || d[0].focus();
        }), c.close = function (b) {
          var c = a.getTop();
          c && c.value.backdrop && 'static' != c.value.backdrop && b.target === b.currentTarget && (b.preventDefault(), b.stopPropagation(), a.dismiss(c.key, 'backdrop click'));
        };
      }
    };
  }
]).directive('modalTransclude', function () {
  return {
    link: function (a, b, c, d, e) {
      e(a.$parent, function (a) {
        b.empty(), b.append(a);
      });
    }
  };
}).factory('$modalStack', [
  '$transition',
  '$timeout',
  '$document',
  '$compile',
  '$rootScope',
  '$$stackedMap',
  function (a, b, c, d, e, f) {
    function g() {
      for (var a = -1, b = n.keys(), c = 0; c < b.length; c++)
        n.get(b[c]).value.backdrop && (a = c);
      return a;
    }
    function h(a) {
      var b = c.find('body').eq(0), d = n.get(a).value;
      n.remove(a), j(d.modalDomEl, d.modalScope, 300, function () {
        d.modalScope.$destroy(), b.toggleClass(m, n.length() > 0), i();
      });
    }
    function i() {
      if (k && -1 == g()) {
        var a = l;
        j(k, l, 150, function () {
          a.$destroy(), a = null;
        }), k = void 0, l = void 0;
      }
    }
    function j(c, d, e, f) {
      function g() {
        g.done || (g.done = !0, c.remove(), f && f());
      }
      d.animate = !1;
      var h = a.transitionEndEventName;
      if (h) {
        var i = b(g, e);
        c.bind(h, function () {
          b.cancel(i), g(), d.$apply();
        });
      } else
        b(g);
    }
    var k, l, m = 'modal-open', n = f.createNew(), o = {};
    return e.$watch(g, function (a) {
      l && (l.index = a);
    }), c.bind('keydown', function (a) {
      var b;
      27 === a.which && (b = n.top(), b && b.value.keyboard && (a.preventDefault(), e.$apply(function () {
        o.dismiss(b.key, 'escape key press');
      })));
    }), o.open = function (a, b) {
      n.add(a, {
        deferred: b.deferred,
        modalScope: b.scope,
        backdrop: b.backdrop,
        keyboard: b.keyboard
      });
      var f = c.find('body').eq(0), h = g();
      if (h >= 0 && !k) {
        l = e.$new(!0), l.index = h;
        var i = angular.element('<div modal-backdrop></div>');
        i.attr('backdrop-class', b.backdropClass), k = d(i)(l), f.append(k);
      }
      var j = angular.element('<div modal-window></div>');
      j.attr({
        'template-url': b.windowTemplateUrl,
        'window-class': b.windowClass,
        size: b.size,
        index: n.length() - 1,
        animate: 'animate'
      }).html(b.content);
      var o = d(j)(b.scope);
      n.top().value.modalDomEl = o, f.append(o), f.addClass(m);
    }, o.close = function (a, b) {
      var c = n.get(a);
      c && (c.value.deferred.resolve(b), h(a));
    }, o.dismiss = function (a, b) {
      var c = n.get(a);
      c && (c.value.deferred.reject(b), h(a));
    }, o.dismissAll = function (a) {
      for (var b = this.getTop(); b;)
        this.dismiss(b.key, a), b = this.getTop();
    }, o.getTop = function () {
      return n.top();
    }, o;
  }
]).provider('$modal', function () {
  var a = {
      options: {
        backdrop: !0,
        keyboard: !0
      },
      $get: [
        '$injector',
        '$rootScope',
        '$q',
        '$http',
        '$templateCache',
        '$controller',
        '$modalStack',
        function (b, c, d, e, f, g, h) {
          function i(a) {
            return a.template ? d.when(a.template) : e.get(angular.isFunction(a.templateUrl) ? a.templateUrl() : a.templateUrl, { cache: f }).then(function (a) {
              return a.data;
            });
          }
          function j(a) {
            var c = [];
            return angular.forEach(a, function (a) {
              (angular.isFunction(a) || angular.isArray(a)) && c.push(d.when(b.invoke(a)));
            }), c;
          }
          var k = {};
          return k.open = function (b) {
            var e = d.defer(), f = d.defer(), k = {
                result: e.promise,
                opened: f.promise,
                close: function (a) {
                  h.close(k, a);
                },
                dismiss: function (a) {
                  h.dismiss(k, a);
                }
              };
            if (b = angular.extend({}, a.options, b), b.resolve = b.resolve || {}, !b.template && !b.templateUrl)
              throw new Error('One of template or templateUrl options is required.');
            var l = d.all([i(b)].concat(j(b.resolve)));
            return l.then(function (a) {
              var d = (b.scope || c).$new();
              d.$close = k.close, d.$dismiss = k.dismiss;
              var f, i = {}, j = 1;
              b.controller && (i.$scope = d, i.$modalInstance = k, angular.forEach(b.resolve, function (b, c) {
                i[c] = a[j++];
              }), f = g(b.controller, i), b.controllerAs && (d[b.controllerAs] = f)), h.open(k, {
                scope: d,
                deferred: e,
                content: a[0],
                backdrop: b.backdrop,
                keyboard: b.keyboard,
                backdropClass: b.backdropClass,
                windowClass: b.windowClass,
                windowTemplateUrl: b.windowTemplateUrl,
                size: b.size
              });
            }, function (a) {
              e.reject(a);
            }), l.then(function () {
              f.resolve(!0);
            }, function () {
              f.reject(!1);
            }), k;
          }, k;
        }
      ]
    };
  return a;
}), angular.module('ui.bootstrap.pagination', []).controller('PaginationController', [
  '$scope',
  '$attrs',
  '$parse',
  function (a, b, c) {
    var d = this, e = { $setViewValue: angular.noop }, f = b.numPages ? c(b.numPages).assign : angular.noop;
    this.init = function (f, g) {
      e = f, this.config = g, e.$render = function () {
        d.render();
      }, b.itemsPerPage ? a.$parent.$watch(c(b.itemsPerPage), function (b) {
        d.itemsPerPage = parseInt(b, 10), a.totalPages = d.calculateTotalPages();
      }) : this.itemsPerPage = g.itemsPerPage;
    }, this.calculateTotalPages = function () {
      var b = this.itemsPerPage < 1 ? 1 : Math.ceil(a.totalItems / this.itemsPerPage);
      return Math.max(b || 0, 1);
    }, this.render = function () {
      a.page = parseInt(e.$viewValue, 10) || 1;
    }, a.selectPage = function (b) {
      a.page !== b && b > 0 && b <= a.totalPages && (e.$setViewValue(b), e.$render());
    }, a.getText = function (b) {
      return a[b + 'Text'] || d.config[b + 'Text'];
    }, a.noPrevious = function () {
      return 1 === a.page;
    }, a.noNext = function () {
      return a.page === a.totalPages;
    }, a.$watch('totalItems', function () {
      a.totalPages = d.calculateTotalPages();
    }), a.$watch('totalPages', function (b) {
      f(a.$parent, b), a.page > b ? a.selectPage(b) : e.$render();
    });
  }
]).constant('paginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: !1,
  directionLinks: !0,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: !0
}).directive('pagination', [
  '$parse',
  'paginationConfig',
  function (a, b) {
    return {
      restrict: 'EA',
      scope: {
        totalItems: '=',
        firstText: '@',
        previousText: '@',
        nextText: '@',
        lastText: '@'
      },
      require: [
        'pagination',
        '?ngModel'
      ],
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: !0,
      link: function (c, d, e, f) {
        function g(a, b, c) {
          return {
            number: a,
            text: b,
            active: c
          };
        }
        function h(a, b) {
          var c = [], d = 1, e = b, f = angular.isDefined(k) && b > k;
          f && (l ? (d = Math.max(a - Math.floor(k / 2), 1), e = d + k - 1, e > b && (e = b, d = e - k + 1)) : (d = (Math.ceil(a / k) - 1) * k + 1, e = Math.min(d + k - 1, b)));
          for (var h = d; e >= h; h++) {
            var i = g(h, h, h === a);
            c.push(i);
          }
          if (f && !l) {
            if (d > 1) {
              var j = g(d - 1, '...', !1);
              c.unshift(j);
            }
            if (b > e) {
              var m = g(e + 1, '...', !1);
              c.push(m);
            }
          }
          return c;
        }
        var i = f[0], j = f[1];
        if (j) {
          var k = angular.isDefined(e.maxSize) ? c.$parent.$eval(e.maxSize) : b.maxSize, l = angular.isDefined(e.rotate) ? c.$parent.$eval(e.rotate) : b.rotate;
          c.boundaryLinks = angular.isDefined(e.boundaryLinks) ? c.$parent.$eval(e.boundaryLinks) : b.boundaryLinks, c.directionLinks = angular.isDefined(e.directionLinks) ? c.$parent.$eval(e.directionLinks) : b.directionLinks, i.init(j, b), e.maxSize && c.$parent.$watch(a(e.maxSize), function (a) {
            k = parseInt(a, 10), i.render();
          });
          var m = i.render;
          i.render = function () {
            m(), c.page > 0 && c.page <= c.totalPages && (c.pages = h(c.page, c.totalPages));
          };
        }
      }
    };
  }
]).constant('pagerConfig', {
  itemsPerPage: 10,
  previousText: '\xab Previous',
  nextText: 'Next \xbb',
  align: !0
}).directive('pager', [
  'pagerConfig',
  function (a) {
    return {
      restrict: 'EA',
      scope: {
        totalItems: '=',
        previousText: '@',
        nextText: '@'
      },
      require: [
        'pager',
        '?ngModel'
      ],
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: !0,
      link: function (b, c, d, e) {
        var f = e[0], g = e[1];
        g && (b.align = angular.isDefined(d.align) ? b.$parent.$eval(d.align) : a.align, f.init(g, a));
      }
    };
  }
]), angular.module('ui.bootstrap.tooltip', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).provider('$tooltip', function () {
  function a(a) {
    var b = /[A-Z]/g, c = '-';
    return a.replace(b, function (a, b) {
      return (b ? c : '') + a.toLowerCase();
    });
  }
  var b = {
      placement: 'top',
      animation: !0,
      popupDelay: 0
    }, c = {
      mouseenter: 'mouseleave',
      click: 'click',
      focus: 'blur'
    }, d = {};
  this.options = function (a) {
    angular.extend(d, a);
  }, this.setTriggers = function (a) {
    angular.extend(c, a);
  }, this.$get = [
    '$window',
    '$compile',
    '$timeout',
    '$document',
    '$position',
    '$interpolate',
    function (e, f, g, h, i, j) {
      return function (e, k, l) {
        function m(a) {
          var b = a || n.trigger || l, d = c[b] || b;
          return {
            show: b,
            hide: d
          };
        }
        var n = angular.extend({}, b, d), o = a(e), p = j.startSymbol(), q = j.endSymbol(), r = '<div ' + o + '-popup title="' + p + 'title' + q + '" content="' + p + 'content' + q + '" placement="' + p + 'placement' + q + '" animation="animation" is-open="isOpen"></div>';
        return {
          restrict: 'EA',
          compile: function () {
            var a = f(r);
            return function (b, c, d) {
              function f() {
                D.isOpen ? l() : j();
              }
              function j() {
                (!C || b.$eval(d[k + 'Enable'])) && (s(), D.popupDelay ? z || (z = g(o, D.popupDelay, !1), z.then(function (a) {
                  a();
                })) : o()());
              }
              function l() {
                b.$apply(function () {
                  p();
                });
              }
              function o() {
                return z = null, y && (g.cancel(y), y = null), D.content ? (q(), w.css({
                  top: 0,
                  left: 0,
                  display: 'block'
                }), A ? h.find('body').append(w) : c.after(w), E(), D.isOpen = !0, D.$digest(), E) : angular.noop;
              }
              function p() {
                D.isOpen = !1, g.cancel(z), z = null, D.animation ? y || (y = g(r, 500)) : r();
              }
              function q() {
                w && r(), x = D.$new(), w = a(x, angular.noop);
              }
              function r() {
                y = null, w && (w.remove(), w = null), x && (x.$destroy(), x = null);
              }
              function s() {
                t(), u();
              }
              function t() {
                var a = d[k + 'Placement'];
                D.placement = angular.isDefined(a) ? a : n.placement;
              }
              function u() {
                var a = d[k + 'PopupDelay'], b = parseInt(a, 10);
                D.popupDelay = isNaN(b) ? n.popupDelay : b;
              }
              function v() {
                var a = d[k + 'Trigger'];
                F(), B = m(a), B.show === B.hide ? c.bind(B.show, f) : (c.bind(B.show, j), c.bind(B.hide, l));
              }
              var w, x, y, z, A = angular.isDefined(n.appendToBody) ? n.appendToBody : !1, B = m(void 0), C = angular.isDefined(d[k + 'Enable']), D = b.$new(!0), E = function () {
                  var a = i.positionElements(c, w, D.placement, A);
                  a.top += 'px', a.left += 'px', w.css(a);
                };
              D.isOpen = !1, d.$observe(e, function (a) {
                D.content = a, !a && D.isOpen && p();
              }), d.$observe(k + 'Title', function (a) {
                D.title = a;
              });
              var F = function () {
                c.unbind(B.show, j), c.unbind(B.hide, l);
              };
              v();
              var G = b.$eval(d[k + 'Animation']);
              D.animation = angular.isDefined(G) ? !!G : n.animation;
              var H = b.$eval(d[k + 'AppendToBody']);
              A = angular.isDefined(H) ? H : A, A && b.$on('$locationChangeSuccess', function () {
                D.isOpen && p();
              }), b.$on('$destroy', function () {
                g.cancel(y), g.cancel(z), F(), r(), D = null;
              });
            };
          }
        };
      };
    }
  ];
}).directive('tooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: !0,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
}).directive('tooltip', [
  '$tooltip',
  function (a) {
    return a('tooltip', 'tooltip', 'mouseenter');
  }
]).directive('tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: !0,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
}).directive('tooltipHtmlUnsafe', [
  '$tooltip',
  function (a) {
    return a('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }
]), angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip']).directive('popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: !0,
    scope: {
      title: '@',
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/popover/popover.html'
  };
}).directive('popover', [
  '$tooltip',
  function (a) {
    return a('popover', 'popover', 'click');
  }
]), angular.module('ui.bootstrap.progressbar', []).constant('progressConfig', {
  animate: !0,
  max: 100
}).controller('ProgressController', [
  '$scope',
  '$attrs',
  'progressConfig',
  function (a, b, c) {
    var d = this, e = angular.isDefined(b.animate) ? a.$parent.$eval(b.animate) : c.animate;
    this.bars = [], a.max = angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max, this.addBar = function (b, c) {
      e || c.css({ transition: 'none' }), this.bars.push(b), b.$watch('value', function (c) {
        b.percent = +(100 * c / a.max).toFixed(2);
      }), b.$on('$destroy', function () {
        c = null, d.removeBar(b);
      });
    }, this.removeBar = function (a) {
      this.bars.splice(this.bars.indexOf(a), 1);
    };
  }
]).directive('progress', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    controller: 'ProgressController',
    require: 'progress',
    scope: {},
    templateUrl: 'template/progressbar/progress.html'
  };
}).directive('bar', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    require: '^progress',
    scope: {
      value: '=',
      type: '@'
    },
    templateUrl: 'template/progressbar/bar.html',
    link: function (a, b, c, d) {
      d.addBar(a, b);
    }
  };
}).directive('progressbar', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    controller: 'ProgressController',
    scope: {
      value: '=',
      type: '@'
    },
    templateUrl: 'template/progressbar/progressbar.html',
    link: function (a, b, c, d) {
      d.addBar(a, angular.element(b.children()[0]));
    }
  };
}), angular.module('ui.bootstrap.rating', []).constant('ratingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null
}).controller('RatingController', [
  '$scope',
  '$attrs',
  'ratingConfig',
  function (a, b, c) {
    var d = { $setViewValue: angular.noop };
    this.init = function (e) {
      d = e, d.$render = this.render, this.stateOn = angular.isDefined(b.stateOn) ? a.$parent.$eval(b.stateOn) : c.stateOn, this.stateOff = angular.isDefined(b.stateOff) ? a.$parent.$eval(b.stateOff) : c.stateOff;
      var f = angular.isDefined(b.ratingStates) ? a.$parent.$eval(b.ratingStates) : new Array(angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max);
      a.range = this.buildTemplateObjects(f);
    }, this.buildTemplateObjects = function (a) {
      for (var b = 0, c = a.length; c > b; b++)
        a[b] = angular.extend({ index: b }, {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        }, a[b]);
      return a;
    }, a.rate = function (b) {
      !a.readonly && b >= 0 && b <= a.range.length && (d.$setViewValue(b), d.$render());
    }, a.enter = function (b) {
      a.readonly || (a.value = b), a.onHover({ value: b });
    }, a.reset = function () {
      a.value = d.$viewValue, a.onLeave();
    }, a.onKeydown = function (b) {
      /(37|38|39|40)/.test(b.which) && (b.preventDefault(), b.stopPropagation(), a.rate(a.value + (38 === b.which || 39 === b.which ? 1 : -1)));
    }, this.render = function () {
      a.value = d.$viewValue;
    };
  }
]).directive('rating', function () {
  return {
    restrict: 'EA',
    require: [
      'rating',
      'ngModel'
    ],
    scope: {
      readonly: '=?',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'RatingController',
    templateUrl: 'template/rating/rating.html',
    replace: !0,
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f && e.init(f);
    }
  };
}), angular.module('ui.bootstrap.tabs', []).controller('TabsetController', [
  '$scope',
  function (a) {
    var b = this, c = b.tabs = a.tabs = [];
    b.select = function (a) {
      angular.forEach(c, function (b) {
        b.active && b !== a && (b.active = !1, b.onDeselect());
      }), a.active = !0, a.onSelect();
    }, b.addTab = function (a) {
      c.push(a), 1 === c.length ? a.active = !0 : a.active && b.select(a);
    }, b.removeTab = function (a) {
      var e = c.indexOf(a);
      if (a.active && c.length > 1 && !d) {
        var f = e == c.length - 1 ? e - 1 : e + 1;
        b.select(c[f]);
      }
      c.splice(e, 1);
    };
    var d;
    a.$on('$destroy', function () {
      d = !0;
    });
  }
]).directive('tabset', function () {
  return {
    restrict: 'EA',
    transclude: !0,
    replace: !0,
    scope: { type: '@' },
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    link: function (a, b, c) {
      a.vertical = angular.isDefined(c.vertical) ? a.$parent.$eval(c.vertical) : !1, a.justified = angular.isDefined(c.justified) ? a.$parent.$eval(c.justified) : !1;
    }
  };
}).directive('tab', [
  '$parse',
  function (a) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/tabs/tab.html',
      transclude: !0,
      scope: {
        active: '=?',
        heading: '@',
        onSelect: '&select',
        onDeselect: '&deselect'
      },
      controller: function () {
      },
      compile: function (b, c, d) {
        return function (b, c, e, f) {
          b.$watch('active', function (a) {
            a && f.select(b);
          }), b.disabled = !1, e.disabled && b.$parent.$watch(a(e.disabled), function (a) {
            b.disabled = !!a;
          }), b.select = function () {
            b.disabled || (b.active = !0);
          }, f.addTab(b), b.$on('$destroy', function () {
            f.removeTab(b);
          }), b.$transcludeFn = d;
        };
      }
    };
  }
]).directive('tabHeadingTransclude', [function () {
    return {
      restrict: 'A',
      require: '^tab',
      link: function (a, b) {
        a.$watch('headingElement', function (a) {
          a && (b.html(''), b.append(a));
        });
      }
    };
  }]).directive('tabContentTransclude', function () {
  function a(a) {
    return a.tagName && (a.hasAttribute('tab-heading') || a.hasAttribute('data-tab-heading') || 'tab-heading' === a.tagName.toLowerCase() || 'data-tab-heading' === a.tagName.toLowerCase());
  }
  return {
    restrict: 'A',
    require: '^tabset',
    link: function (b, c, d) {
      var e = b.$eval(d.tabContentTransclude);
      e.$transcludeFn(e.$parent, function (b) {
        angular.forEach(b, function (b) {
          a(b) ? e.headingElement = b : c.append(b);
        });
      });
    }
  };
}), angular.module('ui.bootstrap.timepicker', []).constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: !0,
  meridians: null,
  readonlyInput: !1,
  mousewheel: !0
}).controller('TimepickerController', [
  '$scope',
  '$attrs',
  '$parse',
  '$log',
  '$locale',
  'timepickerConfig',
  function (a, b, c, d, e, f) {
    function g() {
      var b = parseInt(a.hours, 10), c = a.showMeridian ? b > 0 && 13 > b : b >= 0 && 24 > b;
      return c ? (a.showMeridian && (12 === b && (b = 0), a.meridian === p[1] && (b += 12)), b) : void 0;
    }
    function h() {
      var b = parseInt(a.minutes, 10);
      return b >= 0 && 60 > b ? b : void 0;
    }
    function i(a) {
      return angular.isDefined(a) && a.toString().length < 2 ? '0' + a : a;
    }
    function j(a) {
      k(), o.$setViewValue(new Date(n)), l(a);
    }
    function k() {
      o.$setValidity('time', !0), a.invalidHours = !1, a.invalidMinutes = !1;
    }
    function l(b) {
      var c = n.getHours(), d = n.getMinutes();
      a.showMeridian && (c = 0 === c || 12 === c ? 12 : c % 12), a.hours = 'h' === b ? c : i(c), a.minutes = 'm' === b ? d : i(d), a.meridian = n.getHours() < 12 ? p[0] : p[1];
    }
    function m(a) {
      var b = new Date(n.getTime() + 60000 * a);
      n.setHours(b.getHours(), b.getMinutes()), j();
    }
    var n = new Date(), o = { $setViewValue: angular.noop }, p = angular.isDefined(b.meridians) ? a.$parent.$eval(b.meridians) : f.meridians || e.DATETIME_FORMATS.AMPMS;
    this.init = function (c, d) {
      o = c, o.$render = this.render;
      var e = d.eq(0), g = d.eq(1), h = angular.isDefined(b.mousewheel) ? a.$parent.$eval(b.mousewheel) : f.mousewheel;
      h && this.setupMousewheelEvents(e, g), a.readonlyInput = angular.isDefined(b.readonlyInput) ? a.$parent.$eval(b.readonlyInput) : f.readonlyInput, this.setupInputEvents(e, g);
    };
    var q = f.hourStep;
    b.hourStep && a.$parent.$watch(c(b.hourStep), function (a) {
      q = parseInt(a, 10);
    });
    var r = f.minuteStep;
    b.minuteStep && a.$parent.$watch(c(b.minuteStep), function (a) {
      r = parseInt(a, 10);
    }), a.showMeridian = f.showMeridian, b.showMeridian && a.$parent.$watch(c(b.showMeridian), function (b) {
      if (a.showMeridian = !!b, o.$error.time) {
        var c = g(), d = h();
        angular.isDefined(c) && angular.isDefined(d) && (n.setHours(c), j());
      } else
        l();
    }), this.setupMousewheelEvents = function (b, c) {
      var d = function (a) {
        a.originalEvent && (a = a.originalEvent);
        var b = a.wheelDelta ? a.wheelDelta : -a.deltaY;
        return a.detail || b > 0;
      };
      b.bind('mousewheel wheel', function (b) {
        a.$apply(d(b) ? a.incrementHours() : a.decrementHours()), b.preventDefault();
      }), c.bind('mousewheel wheel', function (b) {
        a.$apply(d(b) ? a.incrementMinutes() : a.decrementMinutes()), b.preventDefault();
      });
    }, this.setupInputEvents = function (b, c) {
      if (a.readonlyInput)
        return a.updateHours = angular.noop, void (a.updateMinutes = angular.noop);
      var d = function (b, c) {
        o.$setViewValue(null), o.$setValidity('time', !1), angular.isDefined(b) && (a.invalidHours = b), angular.isDefined(c) && (a.invalidMinutes = c);
      };
      a.updateHours = function () {
        var a = g();
        angular.isDefined(a) ? (n.setHours(a), j('h')) : d(!0);
      }, b.bind('blur', function () {
        !a.invalidHours && a.hours < 10 && a.$apply(function () {
          a.hours = i(a.hours);
        });
      }), a.updateMinutes = function () {
        var a = h();
        angular.isDefined(a) ? (n.setMinutes(a), j('m')) : d(void 0, !0);
      }, c.bind('blur', function () {
        !a.invalidMinutes && a.minutes < 10 && a.$apply(function () {
          a.minutes = i(a.minutes);
        });
      });
    }, this.render = function () {
      var a = o.$modelValue ? new Date(o.$modelValue) : null;
      isNaN(a) ? (o.$setValidity('time', !1), d.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (a && (n = a), k(), l());
    }, a.incrementHours = function () {
      m(60 * q);
    }, a.decrementHours = function () {
      m(60 * -q);
    }, a.incrementMinutes = function () {
      m(r);
    }, a.decrementMinutes = function () {
      m(-r);
    }, a.toggleMeridian = function () {
      m(720 * (n.getHours() < 12 ? 1 : -1));
    };
  }
]).directive('timepicker', function () {
  return {
    restrict: 'EA',
    require: [
      'timepicker',
      '?^ngModel'
    ],
    controller: 'TimepickerController',
    replace: !0,
    scope: {},
    templateUrl: 'template/timepicker/timepicker.html',
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f && e.init(f, b.find('input'));
    }
  };
}), angular.module('ui.bootstrap.typeahead', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).factory('typeaheadParser', [
  '$parse',
  function (a) {
    var b = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function (c) {
        var d = c.match(b);
        if (!d)
          throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "' + c + '".');
        return {
          itemName: d[3],
          source: a(d[4]),
          viewMapper: a(d[2] || d[1]),
          modelMapper: a(d[1])
        };
      }
    };
  }
]).directive('typeahead', [
  '$compile',
  '$parse',
  '$q',
  '$timeout',
  '$document',
  '$position',
  'typeaheadParser',
  function (a, b, c, d, e, f, g) {
    var h = [
        9,
        13,
        27,
        38,
        40
      ];
    return {
      require: 'ngModel',
      link: function (i, j, k, l) {
        var m, n = i.$eval(k.typeaheadMinLength) || 1, o = i.$eval(k.typeaheadWaitMs) || 0, p = i.$eval(k.typeaheadEditable) !== !1, q = b(k.typeaheadLoading).assign || angular.noop, r = b(k.typeaheadOnSelect), s = k.typeaheadInputFormatter ? b(k.typeaheadInputFormatter) : void 0, t = k.typeaheadAppendToBody ? i.$eval(k.typeaheadAppendToBody) : !1, u = i.$eval(k.typeaheadFocusFirst) !== !1, v = b(k.ngModel).assign, w = g.parse(k.typeahead), x = i.$new();
        i.$on('$destroy', function () {
          x.$destroy();
        });
        var y = 'typeahead-' + x.$id + '-' + Math.floor(10000 * Math.random());
        j.attr({
          'aria-autocomplete': 'list',
          'aria-expanded': !1,
          'aria-owns': y
        });
        var z = angular.element('<div typeahead-popup></div>');
        z.attr({
          id: y,
          matches: 'matches',
          active: 'activeIdx',
          select: 'select(activeIdx)',
          query: 'query',
          position: 'position'
        }), angular.isDefined(k.typeaheadTemplateUrl) && z.attr('template-url', k.typeaheadTemplateUrl);
        var A = function () {
            x.matches = [], x.activeIdx = -1, j.attr('aria-expanded', !1);
          }, B = function (a) {
            return y + '-option-' + a;
          };
        x.$watch('activeIdx', function (a) {
          0 > a ? j.removeAttr('aria-activedescendant') : j.attr('aria-activedescendant', B(a));
        });
        var C = function (a) {
          var b = { $viewValue: a };
          q(i, !0), c.when(w.source(i, b)).then(function (c) {
            var d = a === l.$viewValue;
            if (d && m)
              if (c.length > 0) {
                x.activeIdx = u ? 0 : -1, x.matches.length = 0;
                for (var e = 0; e < c.length; e++)
                  b[w.itemName] = c[e], x.matches.push({
                    id: B(e),
                    label: w.viewMapper(x, b),
                    model: c[e]
                  });
                x.query = a, x.position = t ? f.offset(j) : f.position(j), x.position.top = x.position.top + j.prop('offsetHeight'), j.attr('aria-expanded', !0);
              } else
                A();
            d && q(i, !1);
          }, function () {
            A(), q(i, !1);
          });
        };
        A(), x.query = void 0;
        var D, E = function (a) {
            D = d(function () {
              C(a);
            }, o);
          }, F = function () {
            D && d.cancel(D);
          };
        l.$parsers.unshift(function (a) {
          return m = !0, a && a.length >= n ? o > 0 ? (F(), E(a)) : C(a) : (q(i, !1), F(), A()), p ? a : a ? void l.$setValidity('editable', !1) : (l.$setValidity('editable', !0), a);
        }), l.$formatters.push(function (a) {
          var b, c, d = {};
          return s ? (d.$model = a, s(i, d)) : (d[w.itemName] = a, b = w.viewMapper(i, d), d[w.itemName] = void 0, c = w.viewMapper(i, d), b !== c ? b : a);
        }), x.select = function (a) {
          var b, c, e = {};
          e[w.itemName] = c = x.matches[a].model, b = w.modelMapper(i, e), v(i, b), l.$setValidity('editable', !0), r(i, {
            $item: c,
            $model: b,
            $label: w.viewMapper(i, e)
          }), A(), d(function () {
            j[0].focus();
          }, 0, !1);
        }, j.bind('keydown', function (a) {
          0 !== x.matches.length && -1 !== h.indexOf(a.which) && (-1 != x.activeIdx || 13 !== a.which && 9 !== a.which) && (a.preventDefault(), 40 === a.which ? (x.activeIdx = (x.activeIdx + 1) % x.matches.length, x.$digest()) : 38 === a.which ? (x.activeIdx = (x.activeIdx > 0 ? x.activeIdx : x.matches.length) - 1, x.$digest()) : 13 === a.which || 9 === a.which ? x.$apply(function () {
            x.select(x.activeIdx);
          }) : 27 === a.which && (a.stopPropagation(), A(), x.$digest()));
        }), j.bind('blur', function () {
          m = !1;
        });
        var G = function (a) {
          j[0] !== a.target && (A(), x.$digest());
        };
        e.bind('click', G), i.$on('$destroy', function () {
          e.unbind('click', G), t && H.remove();
        });
        var H = a(z)(x);
        t ? e.find('body').append(H) : j.after(H);
      }
    };
  }
]).directive('typeaheadPopup', function () {
  return {
    restrict: 'EA',
    scope: {
      matches: '=',
      query: '=',
      active: '=',
      position: '=',
      select: '&'
    },
    replace: !0,
    templateUrl: 'template/typeahead/typeahead-popup.html',
    link: function (a, b, c) {
      a.templateUrl = c.templateUrl, a.isOpen = function () {
        return a.matches.length > 0;
      }, a.isActive = function (b) {
        return a.active == b;
      }, a.selectActive = function (b) {
        a.active = b;
      }, a.selectMatch = function (b) {
        a.select({ activeIdx: b });
      };
    }
  };
}).directive('typeaheadMatch', [
  '$http',
  '$templateCache',
  '$compile',
  '$parse',
  function (a, b, c, d) {
    return {
      restrict: 'EA',
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function (e, f, g) {
        var h = d(g.templateUrl)(e.$parent) || 'template/typeahead/typeahead-match.html';
        a.get(h, { cache: b }).success(function (a) {
          f.replaceWith(c(a.trim())(e));
        });
      }
    };
  }
]).filter('typeaheadHighlight', function () {
  function a(a) {
    return a.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }
  return function (b, c) {
    return c ? ('' + b).replace(new RegExp(a(c), 'gi'), '<strong>$&</strong>') : b;
  };
}), angular.module('template/accordion/accordion-group.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/accordion/accordion-group.html', '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a href class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n\t  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>\n');
  }
]), angular.module('template/accordion/accordion.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/accordion/accordion.html', '<div class="panel-group" ng-transclude></div>');
  }
]), angular.module('template/alert/alert.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/alert/alert.html', '<div class="alert" ng-class="[\'alert-\' + (type || \'warning\'), closeable ? \'alert-dismissable\' : null]" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="sr-only">Close</span>\n    </button>\n    <div ng-transclude></div>\n</div>\n');
  }
]), angular.module('template/carousel/carousel.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/carousel/carousel.html', '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-left"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-right"></span></a>\n</div>\n');
  }
]), angular.module('template/carousel/slide.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/carousel/slide.html', '<div ng-class="{\n    \'active\': leaving || (active && !entering),\n    \'prev\': (next || active) && direction==\'prev\',\n    \'next\': (next || active) && direction==\'next\',\n    \'right\': direction==\'prev\',\n    \'left\': direction==\'next\'\n  }" class="item text-center" ng-transclude></div>\n');
  }
]), angular.module('template/datepicker/datepicker.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/datepicker.html', '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"></daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"></monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"></yearpicker>\n</div>');
  }
]), angular.module('template/datepicker/day.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/day.html', '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
  }
]), angular.module('template/datepicker/month.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/month.html', '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
  }
]), angular.module('template/datepicker/popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/popup.html', '<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n\t<li ng-transclude></li>\n\t<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n\t\t<span class="btn-group pull-left">\n\t\t\t<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n\t\t\t<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n\t\t</span>\n\t\t<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n\t</li>\n</ul>\n');
  }
]), angular.module('template/datepicker/year.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/year.html', '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
  }
]), angular.module('template/modal/backdrop.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/modal/backdrop.html', '<div class="modal-backdrop fade {{ backdropClass }}"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n></div>\n');
  }
]), angular.module('template/modal/window.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/modal/window.html', '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}"><div class="modal-content" modal-transclude></div></div>\n</div>');
  }
]), angular.module('template/pagination/pager.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/pagination/pager.html', '<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n</ul>');
  }
]), angular.module('template/pagination/pagination.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/pagination/pagination.html', '<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}</a></li>\n</ul>');
  }
]), angular.module('template/tooltip/tooltip-html-unsafe-popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tooltip/tooltip-html-unsafe-popup.html', '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n');
  }
]), angular.module('template/tooltip/tooltip-popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tooltip/tooltip-popup.html', '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n');
  }
]), angular.module('template/popover/popover.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/popover/popover.html', '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n');
  }
]), angular.module('template/progressbar/bar.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/progressbar/bar.html', '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>');
  }
]), angular.module('template/progressbar/progress.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/progressbar/progress.html', '<div class="progress" ng-transclude></div>');
  }
]), angular.module('template/progressbar/progressbar.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/progressbar/progressbar.html', '<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>\n</div>');
  }
]), angular.module('template/rating/rating.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/rating/rating.html', '<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    </i>\n</span>');
  }
]), angular.module('template/tabs/tab.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tabs/tab.html', '<li ng-class="{active: active, disabled: disabled}">\n  <a href ng-click="select()" tab-heading-transclude>{{heading}}</a>\n</li>\n');
  }
]), angular.module('template/tabs/tabset.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tabs/tabset.html', '<div>\n  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n');
  }
]), angular.module('template/timepicker/timepicker.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/timepicker/timepicker.html', '<table>\n\t<tbody>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n\t\t\t<td>&nbsp;</td>\n\t\t\t<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n\t\t\t<td ng-show="showMeridian"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n\t\t\t\t<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t</td>\n\t\t\t<td>:</td>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n\t\t\t\t<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t</td>\n\t\t\t<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n\t\t</tr>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n\t\t\t<td>&nbsp;</td>\n\t\t\t<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n\t\t\t<td ng-show="showMeridian"></td>\n\t\t</tr>\n\t</tbody>\n</table>\n');
  }
]), angular.module('template/typeahead/typeahead-match.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/typeahead/typeahead-match.html', '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>');
  }
]), angular.module('template/typeahead/typeahead-popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/typeahead/typeahead-popup.html', '<ul class="dropdown-menu" ng-show="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n');
  }
]);
/* ========================================================================
 * bootstrap-switch - v3.0.2
 * http://www.bootstrap-switch.org
 * ========================================================================
 * Copyright 2012-2013 Mattia Larentis
 *
 * ========================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================================
 */
(function () {
  var __slice = [].slice;
  (function ($, window) {
    'use strict';
    var BootstrapSwitch;
    BootstrapSwitch = function () {
      function BootstrapSwitch(element, options) {
        if (options == null) {
          options = {};
        }
        this.$element = $(element);
        this.options = $.extend({}, $.fn.bootstrapSwitch.defaults, {
          state: this.$element.is(':checked'),
          size: this.$element.data('size'),
          animate: this.$element.data('animate'),
          disabled: this.$element.is(':disabled'),
          readonly: this.$element.is('[readonly]'),
          indeterminate: this.$element.data('indeterminate'),
          onColor: this.$element.data('on-color'),
          offColor: this.$element.data('off-color'),
          onText: this.$element.data('on-text'),
          offText: this.$element.data('off-text'),
          labelText: this.$element.data('label-text'),
          baseClass: this.$element.data('base-class'),
          wrapperClass: this.$element.data('wrapper-class'),
          radioAllOff: this.$element.data('radio-all-off')
        }, options);
        this.$wrapper = $('<div>', {
          'class': function (_this) {
            return function () {
              var classes;
              classes = ['' + _this.options.baseClass].concat(_this._getClasses(_this.options.wrapperClass));
              classes.push(_this.options.state ? '' + _this.options.baseClass + '-on' : '' + _this.options.baseClass + '-off');
              if (_this.options.size != null) {
                classes.push('' + _this.options.baseClass + '-' + _this.options.size);
              }
              if (_this.options.animate) {
                classes.push('' + _this.options.baseClass + '-animate');
              }
              if (_this.options.disabled) {
                classes.push('' + _this.options.baseClass + '-disabled');
              }
              if (_this.options.readonly) {
                classes.push('' + _this.options.baseClass + '-readonly');
              }
              if (_this.options.indeterminate) {
                classes.push('' + _this.options.baseClass + '-indeterminate');
              }
              if (_this.$element.attr('id')) {
                classes.push('' + _this.options.baseClass + '-id-' + _this.$element.attr('id'));
              }
              return classes.join(' ');
            };
          }(this)()
        });
        this.$container = $('<div>', { 'class': '' + this.options.baseClass + '-container' });
        this.$on = $('<span>', {
          html: this.options.onText,
          'class': '' + this.options.baseClass + '-handle-on ' + this.options.baseClass + '-' + this.options.onColor
        });
        this.$off = $('<span>', {
          html: this.options.offText,
          'class': '' + this.options.baseClass + '-handle-off ' + this.options.baseClass + '-' + this.options.offColor
        });
        this.$label = $('<label>', {
          html: this.options.labelText,
          'class': '' + this.options.baseClass + '-label'
        });
        if (this.options.indeterminate) {
          this.$element.prop('indeterminate', true);
        }
        this.$element.on('init.bootstrapSwitch', function (_this) {
          return function () {
            return _this.options.onInit.apply(element, arguments);
          };
        }(this));
        this.$element.on('switchChange.bootstrapSwitch', function (_this) {
          return function () {
            return _this.options.onSwitchChange.apply(element, arguments);
          };
        }(this));
        this.$container = this.$element.wrap(this.$container).parent();
        this.$wrapper = this.$container.wrap(this.$wrapper).parent();
        this.$element.before(this.$on).before(this.$label).before(this.$off).trigger('init.bootstrapSwitch');
        this._elementHandlers();
        this._handleHandlers();
        this._labelHandlers();
        this._formHandler();
      }
      BootstrapSwitch.prototype._constructor = BootstrapSwitch;
      BootstrapSwitch.prototype.state = function (value, skip) {
        if (typeof value === 'undefined') {
          return this.options.state;
        }
        if (this.options.disabled || this.options.readonly || this.options.indeterminate) {
          return this.$element;
        }
        if (this.options.state && !this.options.radioAllOff && this.$element.is(':radio')) {
          return this.$element;
        }
        value = !!value;
        this.$element.prop('checked', value).trigger('change.bootstrapSwitch', skip);
        return this.$element;
      };
      BootstrapSwitch.prototype.toggleState = function (skip) {
        if (this.options.disabled || this.options.readonly || this.options.indeterminate) {
          return this.$element;
        }
        return this.$element.prop('checked', !this.options.state).trigger('change.bootstrapSwitch', skip);
      };
      BootstrapSwitch.prototype.size = function (value) {
        if (typeof value === 'undefined') {
          return this.options.size;
        }
        if (this.options.size != null) {
          this.$wrapper.removeClass('' + this.options.baseClass + '-' + this.options.size);
        }
        if (value) {
          this.$wrapper.addClass('' + this.options.baseClass + '-' + value);
        }
        this.options.size = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.animate = function (value) {
        if (typeof value === 'undefined') {
          return this.options.animate;
        }
        value = !!value;
        this.$wrapper[value ? 'addClass' : 'removeClass']('' + this.options.baseClass + '-animate');
        this.options.animate = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.disabled = function (value) {
        if (typeof value === 'undefined') {
          return this.options.disabled;
        }
        value = !!value;
        this.$wrapper[value ? 'addClass' : 'removeClass']('' + this.options.baseClass + '-disabled');
        this.$element.prop('disabled', value);
        this.options.disabled = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.toggleDisabled = function () {
        this.$element.prop('disabled', !this.options.disabled);
        this.$wrapper.toggleClass('' + this.options.baseClass + '-disabled');
        this.options.disabled = !this.options.disabled;
        return this.$element;
      };
      BootstrapSwitch.prototype.readonly = function (value) {
        if (typeof value === 'undefined') {
          return this.options.readonly;
        }
        value = !!value;
        this.$wrapper[value ? 'addClass' : 'removeClass']('' + this.options.baseClass + '-readonly');
        this.$element.prop('readonly', value);
        this.options.readonly = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.toggleReadonly = function () {
        this.$element.prop('readonly', !this.options.readonly);
        this.$wrapper.toggleClass('' + this.options.baseClass + '-readonly');
        this.options.readonly = !this.options.readonly;
        return this.$element;
      };
      BootstrapSwitch.prototype.indeterminate = function (value) {
        if (typeof value === 'undefined') {
          return this.options.indeterminate;
        }
        value = !!value;
        this.$wrapper[value ? 'addClass' : 'removeClass']('' + this.options.baseClass + '-indeterminate');
        this.$element.prop('indeterminate', value);
        this.options.indeterminate = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.toggleIndeterminate = function () {
        this.$element.prop('indeterminate', !this.options.indeterminate);
        this.$wrapper.toggleClass('' + this.options.baseClass + '-indeterminate');
        this.options.indeterminate = !this.options.indeterminate;
        return this.$element;
      };
      BootstrapSwitch.prototype.onColor = function (value) {
        var color;
        color = this.options.onColor;
        if (typeof value === 'undefined') {
          return color;
        }
        if (color != null) {
          this.$on.removeClass('' + this.options.baseClass + '-' + color);
        }
        this.$on.addClass('' + this.options.baseClass + '-' + value);
        this.options.onColor = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.offColor = function (value) {
        var color;
        color = this.options.offColor;
        if (typeof value === 'undefined') {
          return color;
        }
        if (color != null) {
          this.$off.removeClass('' + this.options.baseClass + '-' + color);
        }
        this.$off.addClass('' + this.options.baseClass + '-' + value);
        this.options.offColor = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.onText = function (value) {
        if (typeof value === 'undefined') {
          return this.options.onText;
        }
        this.$on.html(value);
        this.options.onText = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.offText = function (value) {
        if (typeof value === 'undefined') {
          return this.options.offText;
        }
        this.$off.html(value);
        this.options.offText = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.labelText = function (value) {
        if (typeof value === 'undefined') {
          return this.options.labelText;
        }
        this.$label.html(value);
        this.options.labelText = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.baseClass = function (value) {
        return this.options.baseClass;
      };
      BootstrapSwitch.prototype.wrapperClass = function (value) {
        if (typeof value === 'undefined') {
          return this.options.wrapperClass;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.wrapperClass;
        }
        this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(' '));
        this.$wrapper.addClass(this._getClasses(value).join(' '));
        this.options.wrapperClass = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.radioAllOff = function (value) {
        if (typeof value === 'undefined') {
          return this.options.radioAllOff;
        }
        this.options.radioAllOff = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.onInit = function (value) {
        if (typeof value === 'undefined') {
          return this.options.onInit;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.onInit;
        }
        this.options.onInit = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.onSwitchChange = function (value) {
        if (typeof value === 'undefined') {
          return this.options.onSwitchChange;
        }
        if (!value) {
          value = $.fn.bootstrapSwitch.defaults.onSwitchChange;
        }
        this.options.onSwitchChange = value;
        return this.$element;
      };
      BootstrapSwitch.prototype.destroy = function () {
        var $form;
        $form = this.$element.closest('form');
        if ($form.length) {
          $form.off('reset.bootstrapSwitch').removeData('bootstrap-switch');
        }
        this.$container.children().not(this.$element).remove();
        this.$element.unwrap().unwrap().off('.bootstrapSwitch').removeData('bootstrap-switch');
        return this.$element;
      };
      BootstrapSwitch.prototype._elementHandlers = function () {
        return this.$element.on({
          'change.bootstrapSwitch': function (_this) {
            return function (e, skip) {
              var checked;
              e.preventDefault();
              e.stopImmediatePropagation();
              checked = _this.$element.is(':checked');
              if (checked === _this.options.state) {
                return;
              }
              _this.options.state = checked;
              _this.$wrapper.removeClass(checked ? '' + _this.options.baseClass + '-off' : '' + _this.options.baseClass + '-on').addClass(checked ? '' + _this.options.baseClass + '-on' : '' + _this.options.baseClass + '-off');
              if (!skip) {
                if (_this.$element.is(':radio')) {
                  $('[name=\'' + _this.$element.attr('name') + '\']').not(_this.$element).prop('checked', false).trigger('change.bootstrapSwitch', true);
                }
                return _this.$element.trigger('switchChange.bootstrapSwitch', [checked]);
              }
            };
          }(this),
          'focus.bootstrapSwitch': function (_this) {
            return function (e) {
              e.preventDefault();
              return _this.$wrapper.addClass('' + _this.options.baseClass + '-focused');
            };
          }(this),
          'blur.bootstrapSwitch': function (_this) {
            return function (e) {
              e.preventDefault();
              return _this.$wrapper.removeClass('' + _this.options.baseClass + '-focused');
            };
          }(this),
          'keydown.bootstrapSwitch': function (_this) {
            return function (e) {
              if (!e.which || _this.options.disabled || _this.options.readonly || _this.options.indeterminate) {
                return;
              }
              switch (e.which) {
              case 37:
                e.preventDefault();
                e.stopImmediatePropagation();
                return _this.state(false);
              case 39:
                e.preventDefault();
                e.stopImmediatePropagation();
                return _this.state(true);
              }
            };
          }(this)
        });
      };
      BootstrapSwitch.prototype._handleHandlers = function () {
        this.$on.on('click.bootstrapSwitch', function (_this) {
          return function (e) {
            _this.state(false);
            return _this.$element.trigger('focus.bootstrapSwitch');
          };
        }(this));
        return this.$off.on('click.bootstrapSwitch', function (_this) {
          return function (e) {
            _this.state(true);
            return _this.$element.trigger('focus.bootstrapSwitch');
          };
        }(this));
      };
      BootstrapSwitch.prototype._labelHandlers = function () {
        return this.$label.on({
          'mousemove.bootstrapSwitch touchmove.bootstrapSwitch': function (_this) {
            return function (e) {
              var left, pageX, percent, right;
              if (!_this.isLabelDragging) {
                return;
              }
              e.preventDefault();
              _this.isLabelDragged = true;
              pageX = e.pageX || e.originalEvent.touches[0].pageX;
              percent = (pageX - _this.$wrapper.offset().left) / _this.$wrapper.width() * 100;
              left = 25;
              right = 75;
              if (_this.options.animate) {
                _this.$wrapper.removeClass('' + _this.options.baseClass + '-animate');
              }
              if (percent < left) {
                percent = left;
              } else if (percent > right) {
                percent = right;
              }
              _this.$container.css('margin-left', '' + (percent - right) + '%');
              return _this.$element.trigger('focus.bootstrapSwitch');
            };
          }(this),
          'mousedown.bootstrapSwitch touchstart.bootstrapSwitch': function (_this) {
            return function (e) {
              if (_this.isLabelDragging || _this.options.disabled || _this.options.readonly || _this.options.indeterminate) {
                return;
              }
              e.preventDefault();
              _this.isLabelDragging = true;
              return _this.$element.trigger('focus.bootstrapSwitch');
            };
          }(this),
          'mouseup.bootstrapSwitch touchend.bootstrapSwitch': function (_this) {
            return function (e) {
              if (!_this.isLabelDragging) {
                return;
              }
              e.preventDefault();
              if (_this.isLabelDragged) {
                _this.isLabelDragged = false;
                _this.state(parseInt(_this.$container.css('margin-left'), 10) > -(_this.$container.width() / 6));
                if (_this.options.animate) {
                  _this.$wrapper.addClass('' + _this.options.baseClass + '-animate');
                }
                _this.$container.css('margin-left', '');
              } else {
                _this.state(!_this.options.state);
              }
              return _this.isLabelDragging = false;
            };
          }(this),
          'mouseleave.bootstrapSwitch': function (_this) {
            return function (e) {
              return _this.$label.trigger('mouseup.bootstrapSwitch');
            };
          }(this)
        });
      };
      BootstrapSwitch.prototype._formHandler = function () {
        var $form;
        $form = this.$element.closest('form');
        if ($form.data('bootstrap-switch')) {
          return;
        }
        return $form.on('reset.bootstrapSwitch', function () {
          return window.setTimeout(function () {
            return $form.find('input').filter(function () {
              return $(this).data('bootstrap-switch');
            }).each(function () {
              return $(this).bootstrapSwitch('state', this.checked);
            });
          }, 1);
        }).data('bootstrap-switch', true);
      };
      BootstrapSwitch.prototype._getClasses = function (classes) {
        var c, cls, _i, _len;
        if (!$.isArray(classes)) {
          return ['' + this.options.baseClass + '-' + classes];
        }
        cls = [];
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
          c = classes[_i];
          cls.push('' + this.options.baseClass + '-' + c);
        }
        return cls;
      };
      return BootstrapSwitch;
    }();
    $.fn.bootstrapSwitch = function () {
      var args, option, ret;
      option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      ret = this;
      this.each(function () {
        var $this, data;
        $this = $(this);
        data = $this.data('bootstrap-switch');
        if (!data) {
          $this.data('bootstrap-switch', data = new BootstrapSwitch(this, option));
        }
        if (typeof option === 'string') {
          return ret = data[option].apply(data, args);
        }
      });
      return ret;
    };
    $.fn.bootstrapSwitch.Constructor = BootstrapSwitch;
    return $.fn.bootstrapSwitch.defaults = {
      state: true,
      size: null,
      animate: true,
      disabled: false,
      readonly: false,
      indeterminate: false,
      onColor: 'primary',
      offColor: 'default',
      onText: 'ON',
      offText: 'OFF',
      labelText: '&nbsp;',
      baseClass: 'bootstrap-switch',
      wrapperClass: 'wrapper',
      radioAllOff: false,
      onInit: function () {
      },
      onSwitchChange: function () {
      }
    };
  }(window.jQuery, window));
}.call(this));
/**
 * angular-bootstrap-switch
 * @version v0.3.0 - 2014-06-27
 * @author Francesco Pontillo (francescopontillo@gmail.com)
 * @link https://github.com/frapontillo/angular-bootstrap-switch
 * @license Apache License 2.0
**/
'use strict';
// Source: common/module.js
angular.module('frapontillo.bootstrap-switch', []);
// Source: dist/.temp/directives/bsSwitch.js
angular.module('frapontillo.bootstrap-switch').directive('bsSwitch', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: {
        switchActive: '@',
        switchOnText: '@',
        switchOffText: '@',
        switchOnColor: '@',
        switchOffColor: '@',
        switchAnimate: '@',
        switchSize: '@',
        switchLabel: '@',
        switchIcon: '@',
        switchWrapper: '@'
      },
      template: function (tElement) {
        return ('' + tElement.nodeName).toLowerCase() === 'input' ? undefined : '<input>';
      },
      replace: true,
      link: function link(scope, element, attrs, controller) {
        /**
         * Listen to model changes.
         */
        var listenToModel = function () {
          // When the model changes
          controller.$formatters.push(function (newValue) {
            if (newValue !== undefined) {
              $timeout(function () {
                element.bootstrapSwitch('state', newValue || false, true);
              });
            }
          });
          scope.$watch('switchActive', function (newValue) {
            var active = newValue === true || newValue === 'true' || !newValue;
            element.bootstrapSwitch('disabled', !active);
          });
          scope.$watch('switchOnText', function (newValue) {
            element.bootstrapSwitch('onText', getValueOrUndefined(newValue));
          });
          scope.$watch('switchOffText', function (newValue) {
            element.bootstrapSwitch('offText', getValueOrUndefined(newValue));
          });
          scope.$watch('switchOnColor', function (newValue) {
            attrs.dataOn = newValue;
            element.bootstrapSwitch('onColor', getValueOrUndefined(newValue));
          });
          scope.$watch('switchOffColor', function (newValue) {
            attrs.dataOff = newValue;
            element.bootstrapSwitch('offColor', getValueOrUndefined(newValue));
          });
          scope.$watch('switchAnimate', function (newValue) {
            element.bootstrapSwitch('animate', scope.$eval(newValue || 'true'));
          });
          scope.$watch('switchSize', function (newValue) {
            element.bootstrapSwitch('size', newValue);
          });
          scope.$watch('switchLabel', function (newValue) {
            element.bootstrapSwitch('labelText', newValue ? newValue : '&nbsp;');
          });
          scope.$watch('switchIcon', function (newValue) {
            if (newValue) {
              // build and set the new span
              var spanClass = '<span class=\'' + newValue + '\'></span>';
              element.bootstrapSwitch('labelText', spanClass);
            }
          });
          scope.$watch('switchWrapper', function (newValue) {
            // Make sure that newValue is not empty, otherwise default to null
            if (!newValue) {
              newValue = null;
            }
            element.bootstrapSwitch('wrapperClass', newValue);
          });
        };
        /**
         * Listen to view changes.
         */
        var listenToView = function () {
          // When the switch is clicked, set its value into the ngModelController's $viewValue
          element.on('switchChange.bootstrapSwitch', function (e, data) {
            scope.$apply(function () {
              controller.$setViewValue(data);
            });
          });
        };
        /**
         * Returns the value if it is truthy, or undefined.
         *
         * @param value The value to check.
         * @returns the original value if it is truthy, {@link undefined} otherwise.
         */
        var getValueOrUndefined = function (value) {
          return value ? value : undefined;
        };
        // Listen and respond to model changes
        listenToModel();
        // Bootstrap the switch plugin
        element.bootstrapSwitch();
        // Listen and respond to view changes
        listenToView();
        // Delay the setting of the state
        $timeout(function () {
          element.bootstrapSwitch('state', controller.$modelValue || false, true);
        });
        // On destroy, collect ya garbage
        scope.$on('$destroy', function () {
          element.bootstrapSwitch('destroy');
        });
      }
    };
  }
]);
/*
 * angular-google-picker
 *
 * Interact with the Google API Picker
 * More information about the Google API can be found at https://developers.google.com/picker/
 *
 * (c) 2014 Loic Kartono
 * License: MIT
 */
angular.module('lk-google-picker', []).provider('lkGoogleSettings', function () {
  this.apiKey = null;
  this.clientId = null;
  this.scopes = ['https://www.googleapis.com/auth/drive'];
  this.features = ['MULTISELECT_ENABLED'];
  this.views = [
    'DocsView().setIncludeFolders(true)',
    'DocsUploadView().setIncludeFolders(true)'
  ];
  this.locale = 'en';
  // Default to English
  /**
   * Provider factory $get method
   * Return Google Picker API settings
   */
  this.$get = function () {
    return {
      apiKey: this.apiKey,
      clientId: this.clientId,
      scopes: this.scopes,
      features: this.features,
      views: this.views,
      locale: this.locale
    };
  };
  /**
   * Set the API config params using a hash
   */
  this.configure = function (config) {
    for (key in config) {
      this[key] = config[key];
    }
  };
}).directive('lkGooglePicker', [
  'lkGoogleSettings',
  '$http',
  function (lkGoogleSettings, $http) {
    return {
      restrict: 'A',
      scope: { pickerFiles: '=' },
      link: function (scope, element, attrs) {
        var accessToken = null;
        /**
       * Load required modules
       */
        function instanciate() {
          gapi.load('auth', { 'callback': onApiAuthLoad });
          gapi.load('picker');
        }
        /**
       * OAuth autorization
       * If user is already logged in, then open the Picker modal
       */
        function onApiAuthLoad() {
          if (gapi.auth.getToken() && accessToken) {
            openDialog();
          } else {
            gapi.auth.authorize({
              'client_id': lkGoogleSettings.clientId,
              'scope': lkGoogleSettings.scopes,
              'immediate': false
            }, handleAuthResult);
          }
        }
        /**
       * Google API OAuth response
       */
        function handleAuthResult(result) {
          if (result && !result.error) {
            accessToken = result.access_token;
            openDialog();
          }
        }
        /**
       * Everything is good, open the files picker
       */
        function openDialog() {
          var picker = new google.picker.PickerBuilder().setLocale(lkGoogleSettings.locale).setDeveloperKey(lkGoogleSettings.apiKey).setOAuthToken(accessToken).setCallback(pickerResponse);
          if (lkGoogleSettings.features.length > 0) {
            angular.forEach(lkGoogleSettings.features, function (feature, key) {
              picker.enableFeature(google.picker.Feature[feature]);
            });
          }
          if (lkGoogleSettings.views.length > 0) {
            angular.forEach(lkGoogleSettings.views, function (view, key) {
              var view = eval('new google.picker.' + view);
              picker.addView(view);
            });
          }
          picker.build().setVisible(true);
        }
        /**
       * Callback invoked when interacting with the Picker
       * data: Object returned by the API
       */
        function pickerResponse(data) {
          if (data.action == google.picker.Action.PICKED) {
            gapi.client.load('drive', 'v2', function () {
              angular.forEach(data.docs, function (file, index) {
                file.accessToken = accessToken;
                gapi.client.request({ path: 'https://www.googleapis.com/drive/v2/files/' + file.id }).then(function (resp) {
                  var metadata = resp.result;
                  file.export = metadata.exportLinks['text/html'];
                  file.thumb = metadata.thumbnailLink;
                  scope.pickerFiles = file;
                  scope.$apply();
                }, function (reason) {
                  console.log('Error: ' + reason.result.error.message);
                });
                scope.pickerFiles = file;
              });
              scope.$apply();
            });
          }
        }
        gapi.load('auth');
        gapi.load('picker');
        element.bind('click', function (e) {
          instanciate();
        });
      }
    };
  }
]);