// Search bar for index.html
const searchBar = document.getElementById('searchBar');
if (searchBar) {
    searchBar.addEventListener('input', function() {
        const filter = searchBar.value.toLowerCase();
        const table = document.querySelector('#allGamesTable tbody');
        const rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const title = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
            const consoleName = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
            if (title.includes(filter) || consoleName.includes(filter)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    });
}
