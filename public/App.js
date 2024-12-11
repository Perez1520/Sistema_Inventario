document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('searchInput');

    // Cargar datos del inventario desde el servidor
    loadInventory();

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const productName = document.getElementById('productName').value;
        const productQuantity = document.getElementById('productQuantity').value;

        await addProductToServer(productName, productQuantity);
        productForm.reset();
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const filter = searchInput.value.toLowerCase();
            const rows = inventoryTable.getElementsByTagName('tr');
            let found = false;
            Array.from(rows).forEach(row => {
                const productName = row.cells[0].textContent.toLowerCase();
                if (productName.includes(filter)) {
                    row.style.display = '';
                    found = true;
                } else {
                    row.style.display = 'none';
                }
            });
            if (!found && filter !== '') {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Lo siento, este producto no existe",
                    footer: '<a href="#">¿Por qué tengo este problema?</a>'
                });
            }
        }
    });

    async function addProductToTable(id, name, quantity) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td><input type="number" value="${quantity}" class="form-control quantity-input"></td>
            <td>
                <button class="btn btn-success btn-sm save-btn mr-2">Guardar</button>
                <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
            </td>
        `;
        inventoryTable.appendChild(row);
        const saveButton = row.querySelector('.save-btn');
        saveButton.addEventListener('click', async () => {
            const input = row.querySelector('.quantity-input');
            const newQuantity = input.value;
            const result = await updateProductInServer(id, newQuantity);
            if (result.message === 'Producto actualizado') {
                Swal.fire({
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.addEventListener('click', async () => {
            Swal.fire({
                title: '¿Estás seguro?',
                text: '¡No podrás revertir esto!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminarlo'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteProductFromServer(id);
                    row.remove();
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El producto ha sido eliminado.',
                        icon: 'success'
                    });
                }
            });
        });
    }

    async function addProductToServer(name, quantity) {
        const response = await fetch('/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, quantity })
        });
        const product = await response.json();
        addProductToTable(product.id, name, quantity);
        Swal.fire({
            icon: 'success',
            title: 'Producto agregado exitosamente',
            showConfirmButton: false,
            timer: 1500
        });
    }

    async function updateProductInServer(id, quantity) {
        const response = await fetch(`/inventory/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity })
        });
        const result = await response.json();
        return result;
    }

    async function deleteProductFromServer(id) {
        await fetch(`/inventory/${id}`, {
            method: 'DELETE'
        });
    }

    async function loadInventory() {
        const response = await fetch('/inventory');
        const products = await response.json();
        products.forEach(product => {
            addProductToTable(product.id, product.name, product.quantity);
        });
    }
});