export function getFromLS(storageName, key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem(storageName)) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

export function saveToLS(storageName, key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      storageName,
      JSON.stringify({
        [key]: value
      })
    );
  }
}
