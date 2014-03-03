function GUID() {
  function gen() {
    var b = (1 + Math.random()) * 0x10000;
    return b.toString(16).substring(1);
  }
  var array = [];
  array.push(gen());
  array.push(gen());
  array.push('-');
  array.push(gen());
  array.push('-');
  array.push(gen());
  array.push('-');
  array.push(gen());
  array.push('-');
  array.push(gen());
  array.push(gen());
  array.push(gen());
  return array.join('');
}