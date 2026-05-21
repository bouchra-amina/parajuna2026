function renderInscriptions(inscriptions) {

    totalCount.textContent = inscriptions.length;

    if (inscriptions.length === 0) {
        inscriptionsTable.innerHTML = `
            <tr>
                <td colspan="13" style="text-align:center; padding:25px;">
                    Aucune inscription trouvée.
                </td>
            </tr>
        `;
        return;
    }

    inscriptionsTable.innerHTML = inscriptions.map(item => {

        const progLines = (item.program || "").split("\n");

        const dimanche = progLines[0]?.replace("Dimanche:", "").trim() || "-";
        const lundi = progLines[1]?.replace("Lundi:", "").trim() || "-";
        const mardi = progLines[2]?.replace("Mardi:", "").trim() || "-";
        const mercredi = progLines[3]?.replace("Mercredi:", "").trim() || "-";

        const date = item.created_at
            ? new Date(item.created_at).toLocaleDateString("fr-FR")
            : "-";

        return `
            <tr>
                <td>${item.lastname || "-"}</td>
                <td>${item.firstname || "-"}</td>
                <td>${item.email || "-"}</td>
                <td>${item.phone || "-"}</td>
                <td>${item.profession || "-"}</td>
                <td>${item.status || "-"}</td>
                <td>${item.wilaya || "-"}</td>

                <!-- ✔ JOUR / PROGRAMME -->
                <td>${dimanche}</td>
                <td>${lundi}</td>
                <td>${mardi}</td>
                <td>${mercredi}</td>

                <td>${date}</td>

                <!-- PRESENCE -->
                <td>
                    <input type="checkbox"
                        class="presence-checkbox"
                        data-id="${item.id}"
                        ${item.presence == 1 ? "checked" : ""}>
                </td>

                <!-- ACTION -->
                <td>
                    <button class="btn-delete" onclick="deleteInscription('${item.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}
