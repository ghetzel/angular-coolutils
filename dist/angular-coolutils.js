angular.module('coolutils', ['ng']).
filter('titleize', function(){
  return function(text){
    if(angular.isString(text)){
      return text.replace(/_/g, ' ').toTitleCase();
    }else{
      return text;
    }
  };
}).
filter('camelize', function(){
  return function(text){
    if(text){
      return text.toLowerCase().replace(/(?:^|[\ \_\-])(.)/g, function(match, group1) {
        return group1.toUpperCase();
      });
    }

    return text;
  };
}).
filter('autosize', function(){
  return function(bytes, fixTo, fuzz){
    bytes = parseInt(bytes);
    fuzz = (angular.isUndefined(fuzz) ? 0.99 : +fuzz);
    if(angular.isUndefined(fuzz)) fixTo = 2;

    if(bytes >=   (Math.pow(1024,8) * fuzz))
      return (bytes / Math.pow(1024,8)).toFixed(fixTo) + ' YB';

    else if(bytes >=   (Math.pow(1024,7) * fuzz))
      return (bytes / Math.pow(1024,7)).toFixed(fixTo) + ' ZB';

    else if(bytes >=   (Math.pow(1024,6) * fuzz))
      return (bytes / Math.pow(1024,6)).toFixed(fixTo) + ' EB';

    else if(bytes >=   (Math.pow(1024,5) * fuzz))
      return (bytes / Math.pow(1024,5)).toFixed(fixTo) + ' PB';

    else if(bytes >=   (Math.pow(1024,4) * fuzz))
      return (bytes / Math.pow(1024,4)).toFixed(fixTo) + ' TB';

    else if(bytes >=   (1073741824 * fuzz))
      return (bytes / 1073741824).toFixed(fixTo) + ' GB';

    else if(bytes >=   (1048576 * fuzz))
      return (bytes / 1048576).toFixed(fixTo) + ' MB';

    else if(bytes >=   (1024 * fuzz))
      return (bytes / 1024).toFixed(fixTo) + ' KB';

    else
      return bytes + ' bytes';
  }
}).
filter('autospeed', function(){
  return function(speed,unit,fixTo,fuzz){
    speed = parseInt(speed);
    fuzz = (angular.isUndefined(fuzz) ? 0.99 : +fuzz);
    if(angular.isUndefined(fuzz)) fixTo = 2;

    if(unit){
      switch(unit.toUpperCase()){
      case 'K':
        speed = speed * 1000;
        break;
      case 'M':
        speed = speed * 1000000;
        break;
      case 'G':
        speed = speed * 1000000000;
        break;
      case 'T':
        speed = speed * 1000000000000;
        break;
      }
    }

    if(speed >= 1000000000000*fuzz)
      return (speed/1000000000000).toFixed(fixTo)+' THz';

    else if(speed >= 1000000000*fuzz)
      return (speed/1000000000).toFixed(fixTo)+' GHz';

    else if(speed >= 1000000*fuzz)
      return (speed/1000000).toFixed(fixTo)+' MHz';

    else if(speed >= 1000*fuzz)
      return (speed/1000).toFixed(fixTo)+' KHz';

    else
      return speed.toFixed(fixTo) + ' Hz';
  };
}).
filter('fix', function(){
  return function(number, fixTo){
    return parseFloat(number).toFixed(parseInt(fixTo));
  }
}).
filter('plural', function(){
  return function(number, singular, plural, none){
    if(number == 1){
      return singular;
    }else if(angular.isDefined(none) && number == 0){
      return none;
    }else{
      return plural;
    }
  }
}).
filter('timeAgo', function(){
  return function(date){
    return moment(Date.parse(date)).fromNow();
  };
}).
filter('timeFormat', function(){
  return function(date, format, inputUnit){
    if(angular.isUndefined(date) || date == null){
      date = new Date();
    }

    if(angular.isNumber(date)){
      return moment(date).startOf('day').add((inputUnit || 'seconds'), date).format(format);
    }else{
      return moment(date).format(format);
    }
  };
}).
filter('timeAgoHuman', function(){
  return function(time, format, start){
    if(angular.isUndefined(format)){
      format = '[%Y years, ][%M months, ][%D days, ]%02h:%02m:%02s';
    }

    if(angular.isDefined(start)){
      var start = moment(start);
    }else{
      var start = moment();
    }

    var millisecondsAgo = start.diff(time);
    var units = {
      years:   (1000 * 60 * 60 * 24 * 365),
      months:  (1000 * 60 * 60 * 24 * 30),
      days:    (1000 * 60 * 60 * 24),
      hours:   (1000 * 60 * 60),
      minutes: (1000 * 60),
      seconds: 1000
    };

    var processingOrder = [
      ['Y',  'years'],
      ['M',  'months'],
      ['D',  'days'],
      ['h',  'hours'],
      ['m',  'minutes'],
      ['s',  'seconds'],
      ['ms', 'msec']
    ];

    var rv = [];


//  loop through the processing order of supported units of time
//  for each unit, find and replace the relevant part of the format
//  string (if any) with the formatted unit of time, then reduce the
//  current time difference by that unit so the next iteration does not
//  include it in the calculation
//
//  e.g.:  3,650,000 milliseconds
//
//    years?   0
//    months?  0
//    days?    0
//    hours?   :=  INT(3,650,000 / 3,600,000) (# milliseconds in an hour) == 1
//                 set current count to (3,650,000 - (3,600,000 * 1))     -> 50,000
//    minutes? 0 (50,000 is less than 1000*60 [60,000])
//    seconds? :=  INT(50,000 / 1000) (# of milliseconds is one seconds)  == 50
//
//    RESULT:  1 hour, 50 seconds
//
    for(var i = 0; i < processingOrder.length; i++){
      var token = processingOrder[i][0];
      var unit  = units[processingOrder[i][1]];
      var rx    = new RegExp('\\[?%(.[0-9]+)?'+token+'(?:(.*?)\\])?');
      var match = format.match(rx);


      if(match && millisecondsAgo >= unit){
        var number = parseInt(millisecondsAgo / unit);

        if(angular.isDefined(number)){
      //  padding to n places with given character
          if(angular.isString(match[1]) && match[1].length >= 2){
            var spaces = parseInt(match[1].slice(1));
            var padchar = match[1].slice(0,1);
            number = String(Array(spaces).join(padchar)+number.toString()).slice(-1*spaces);
          }

      //  replace matched part of format string with the formatted version
          format = format.replace(rx, number.toString()+(match[2] || ''));
        }

        millisecondsAgo = millisecondsAgo - (parseInt(millisecondsAgo / unit)*unit);
      }

    }

    return format.replace(/\[.*?\]/g,'');
  }
}).
filter('section', function(){
  return function(str, delim, start, len){
    if(str){
      var rv = str.split(delim);
      start = parseInt(start);
      len = parseInt(len);

      if(angular.isNumber(start)){
        if(angular.isNumber(len)){
          return rv.slice(start, len).join(delim);
        }

        return rv.slice(start).join(delim);
      }

      return str;
    }

    return null;
  };
}).
filter('jsonify', function () {
  return function(obj){
    return angular.toJson(obj);
  };
}).
filter('fetch', function() {
  var _fetch = function(obj, path, defval){
    if(angular.isUndefined(path)){ return obj; }

    if(angular.isObject(obj)){
      if(!angular.isArray(path)){
        path = path.split('.');
      }

      if(angular.isDefined(path[0])){
        if(angular.isArray(obj)){
          var rv = [];

          angular.forEach(obj, function(i){
            rv.push(_fetch(i, path, defval));
          });

          return rv;

        }else if(angular.isObject(obj) && obj.hasOwnProperty(path[0])){
          var rv = _fetch(obj[path[0]], path.slice(1), defval);
          return rv;
        }
      }else{
        if(obj == null || angular.isUndefined(obj)){
          return defval;
        }else{
          return obj;
        }
      }
    }

    return null;
  }

  return _fetch;
}).
filter('split', function() {
  return function(string, delimiter){
    return string.toString().split(delimiter);
  }
}).
config(['$provide', function($provide) {
  $provide.factory('truncateFilter', function(){
    return function(text, length, start){
      if(angular.isUndefined(start)){
        start = 0;
      }

      if(text.length <= length || start > test.length){
        return text;
      }else{
        return String(text).substring(start, length);
      }
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('skipFilter', function(){
    return function(array, skip){
      if (!angular.isArray(array)){
        return array;
      }

      skip = parseInt(skip);
      rv = [];

      if(skip > array.length) return [];

      for(var i = skip; i < array.length; i++){
        rv.push(array[i]);
      }

      return rv;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('sliceFilter', function(){
    return function(array, start, end){
      if (!angular.isArray(array)){
        return array;
      }

      return array.slice((start || 0), end);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('floorFilter', function(){
    return function(value){
      if(!angular.isNumber(value)){
        return null;
      }

      return Math.floor(value);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('ceilingFilter', function(){
    return function(value){
      if(!angular.isNumber(value)){
        return null;
      }

      return Math.ceil(value);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('splitFilter', function(){
    return function(string, delimiter){
      return string.toString().split(delimiter);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('joinFilter', function(){
    return function(array, delimiter){
      if (!angular.isArray(array)){
        return array;
      }

      if(angular.isUndefined(delimiter)){
        delimiter = '';
      }

      return array.join(delimiter);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('emptyFilter', function(){
    return function(array, key){
      if (!angular.isArray(array)){
        return array;
      }

      rv = array.filter(function(i){
        if(angular.isObject(i)){
          return i.hasOwnProperty(key) && !i[key];
        }else if(angular.isString(i)){
          return (i.length != 0);
        }else{
          return !i;
        }
      });

      return rv;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('compactFilter', function(){
    return function(array,key){
      if (!angular.isArray(array)){
        return array;
      }

      rv = array.filter(function(i){
        if(angular.isObject(i)){
          return i.hasOwnProperty(key) && i[key];
        }else if(angular.isString(i)){
          return (i.length == 0);
        }else if(angular.isUndefined(i) || i == null){
          return false;
        }else{
          return i;
        }
      });

      return rv;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('propertyFilter', function(){
    return function(array,key,value,exclude){
      if (!angular.isArray(array)){
        return array;
      }

      rv = array.filter(function(i){
        if(angular.isObject(i)){
          var v = (exclude ? !i.hasOwnProperty(key) : i.hasOwnProperty(key));

          if(v && angular.isDefined(value) && i[key] == value){
            return true;
          }else{
            return false;
          }
        }else{
          return array;
        }
      });
      return rv;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('flattenFilter', function(){
    return function(array){
      if (!angular.isArray(array)){
        return array;
      }

      return array.reduce(function(a,b){
        return a.concat(b);
      });
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('fetchFilter', function(){
    return function(hash, key, fallback){
      if(!angular.isObject(hash) || !key){
        return hash;
      }

      return propertyGet(hash, key, fallback);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('lengthFilter', function(){
    return function(obj){
      if(angular.isArray(obj)){
        return obj.length;
      }else if(angular.isObject(obj)){
        return Object.keys(obj).length;
      }else if(angular.isString(obj)){
        return obj.length;
      }else{
        return null;
      }
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('fillArrayFilter', function(){
    return function(upper, lower){
      var rv = [];

      if(angular.isUndefined(lower)){
        lower = 0;
      }else{
        lower = parseInt(lower);
      }

      upper = parseInt(upper);

      for(var i = lower; i < (upper+lower); i++){
        rv.push(i);
      }

      return rv;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('rangeFilter', function(){
    return function(input, total, offset) {
      total = parseFloat(total);

      if(angular.isUndefined(offset)){
        offset = 0;
      }

      for (var i=offset; i<(total+offset); i++){
        input.push(i);
      }

      return input;
    };
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('isDateFilter', function(){
    return function(obj){
      return angular.isDate(obj);
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('isEmptyFilter', function(){
    return function(obj, trace){
      if(angular.isString(obj) && obj.length == 0){
        return true;
      }else if(angular.isObject(obj) && obj.length == 0){
        return true;
      }else if(angular.isUndefined(obj)){
        return true;
      }else if(obj === null){
        return true;
      }

      return false;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('replaceFilter', function(){
    return function(str,find,rep,all){
      if(angular.isArray(str)){
        for(var i in str){
          if(angular.isString(str[i])){
            if(all == true){
              str[i] = str[i].replace(new RegExp(find,'g'), rep);
            }else{
              str[i] = str[i].replace(find, rep);
            }
          }
        }

        return str;
      }else if(angular.isString(str)){
        if(all == true){
          return str.replace(new RegExp(find,'g'), rep);
        }

        return str.replace(find, rep);
      }else{
        return str;
      }
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('selectFilter', function(){
    return function(obj, value){
      if(angular.isArray(obj)){
        return obj.filter(function(i){
          if(angular.isArray(value)){
            return (value.indexOf(i) >= 0);
          }else{
            return i == value;
          }
        });
      }else if(angular.isObject(obj)){
        var rv = {};
        angular.forEach(obj, function(v,k){
          if(v==value){
            rv[k] = v;
          }
        });

        return rv;
      }else{
        return obj;
      }
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('rejectFilter', function(){
    return function(obj,value){
      if(angular.isArray(obj)){
        return obj.filter(function(i){
          if(angular.isArray(value)){
            return (value.indexOf(i) < 0);
          }else{
            return i != value;
          }
        });
      }else if(angular.isObject(obj)){
        var rv = {};
        angular.forEach(obj, function(v,k){
          if(v!=value){
            rv[k] = v;
          }
        });

        return rv;
      }else{
        return obj;
      }
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('keysFilter', function(){
    return function(obj){
      var rv = [];

      if(angular.isArray(obj) && angular.isObject(obj[0])){
        angular.forEach(obj, function(value, idx){
          rv = rv.concat(Object.keys(value));
        });
      }else if(angular.isObject(obj)){
        rv = Object.keys(obj);
      }

      return rv;
    }
  });
}]).
config(['$provide', function($provide) {
  $provide.factory('valuesFilter', function(){
    return function(obj){
      var rv = [];
      if(angular.isObject(obj)){
        angular.forEach(obj, function(v){
          rv.push(v);
        });
      }

      return rv;
    }
  });
}]);