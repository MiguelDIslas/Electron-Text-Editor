window.addEventListener('DOMContentLoaded', () => {
    let $ = require('jquery');
    const {
        ipcRenderer
    } = require('electron');
    const path = require('path');
    const fs = require('fs');
    const {
        default: Swal
    } = require('sweetalert2');
    var fileP;

    const el = {
        documentName: $("#documentName"),
        createDocumentBtn: $("#createDocumentBtn"),
        openDocumentBtn: $("#openDocumentBtn"),
        fileTextArea: $("#fileTextArea"),
        saveDocumentBtn: $("#saveDocumentBtn"),
        sideBar: $("#sideBar"),
    }

    const handleOpenDocument = (filePath, content = "") => {
        directory = filePath.split('\\');
        var margin = 10;
        el.sideBar.empty();
        directory.forEach(function (data) {
            if (data != "C:") {
                var option = `<li class="nav-item" style="margin:10px 0px 10px ${margin / 2}px;"}>
                                <i class="fa-solid fa-angle-right"></i> ${data}</li>`;
                el.sideBar.append(option);
                margin += 5;
            }
        });
        el.documentName.html(path.parse(filePath).base);
        el.fileTextArea.removeAttr("disabled");
        el.fileTextArea.val(content);
        el.fileTextArea.focus();
        el.saveDocumentBtn.removeClass("invisible");
        el.saveDocumentBtn.removeAttr("disabled");
    }

    // Create Document
    el.createDocumentBtn.click(() => {
        ipcRenderer.send("create-document-triggered");
    });

    ipcRenderer.on("document-created", (_, filePath) => {
        fileP = filePath;
        handleOpenDocument(filePath);
    });

    // Open Document
    el.openDocumentBtn.click(() => {
        ipcRenderer.send("open-document-triggered");
    });

    ipcRenderer.on("document-opened", (_, {
        filePath,
        content
    }) => {
        fileP = filePath;
        handleOpenDocument(filePath, content);
    });

    // Save Document
    el.saveDocumentBtn.click(() => {
        fs.writeFile(fileP, el.fileTextArea.val(), (error) => {
            if (error) {
                alert(error);
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-start',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Your document has been saved'
                });
            }
        });
    });

});