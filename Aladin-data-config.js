function parseTime (timeStr) {
    let year = parseInt(timeStr.substr(0, 4)) - 1990;
    let month = parseInt(timeStr.substr(5, 2));
    let day = parseInt(timeStr.substr(8, 2));
    return 365*year + 30*month + day;
}
function prepareSNeData (catalog, start, end) {
    let newSources = A.catalog({onClick: 'showPopup'});
    for (const source of catalog.sources) {
        let time = parseInt(source.data.EpMax.substr(0, 4));
        if (time >= start && time <= end) {
            newSources.addSources(source);
        }
    }
    return newSources;
}
function sortByTime (catalog, SRe) {
    catalog.sources.sort(function(a, b){
        if (SRe) {
            var aTime = parseTime(a.data.EpMax);
            var bTime = parseTime(b.data.EpMax);
        } else {
            var aTime = parseTime(a.data.Date);
            var bTime = parseTime(b.data.Date);
        }
        if (aTime < bTime) {
            return -1;
        } else if (aTime > bTime) {
            return 1;
        }
        return 0;
    });
    return catalog;
}
function promiseSRe (catalog) {
    var promise = new Promise(function(resolve) {
        setTimeout(() => {resolve(sortByTime(prepareSNeData(catalog, 1990, 2014), true))}, 4000);
    });
    return promise;
}
function promiseGRB (catalog) {
    var promise = new Promise(function(resolve) {
        setTimeout(() => {resolve(sortByTime(catalog, false))}, 1000);
    });
    return promise;
}
async function prepareData () {
    let aladin = A.aladin('#aladin-lite-div', {target: 'M 45', fov: 5});
    let rawSNeCatalog = await A.catalogFromURL('https://vizier.unistra.fr/viz-bin/votable?-source=B/sn/sncat&-c=galactic%20center&-out.max=9999&-out.add=EpMax&-c.rd=180', {onClick: 'showPopup'});
    let rawGRBCatalog = await A.catalogFromVizieR('IX/51/table2', 'galactic center', 180, {onClick: 'showPopup'});
    await aladin.addCatalog(rawSNeCatalog);
    await aladin.addCatalog(rawGRBCatalog);
    var output = {};
    output.SNe = await promiseSRe(rawSNeCatalog);
    output.GRB = await promiseGRB(rawGRBCatalog);
    return output;
}
