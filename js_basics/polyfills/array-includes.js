// polyfills/array-includes.js
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(search, fromIndex) {
      if (this == null) throw new TypeError('"this" is null or not defined');
      const o = Object(this);
      const len = o.length >>> 0;
      if (len === 0) return false;
      let k = Math.max(fromIndex | 0, 0);
      while (k < len) {
        if (o[k] === search || (Number.isNaN(o[k]) && Number.isNaN(search))) return true;
        k++;
      }
      return false;
    }
  });
}
