/**
 * home.jsp
 */

var locationpath = "root";
var parentpath = "null";

$(function() {
	getServerOS();
	showFolderView('root');
});

// 获取服务器操作系统
function getServerOS() {
	$.ajax({
		type : "POST",
		dataType : "text",
		data : {

		},
		url : "homeController/getServerOS.ajax",
		success : function(result) {
			$("#serverOS").text(result);
		},
		error : function() {
			$("#serverOS").html("<a onclick='getServerOS()'>获取失败，点击重试</a>");
		}
	});
}

// 获取实时文件夹视图
function showFolderView(fid) {
	$.ajax({
		type : 'POST',
		dataType : 'text',
		data : {
			fid : fid
		},
		url : 'homeController/getFolderView.ajax',
		success : function(result) {
			var folderView = eval("(" + result + ")");
			locationpath = folderView.folder.folderId;
			parentpath = folderView.folder.folderParent;
			showParentList(folderView);
			showAccountView(folderView);
			showPublishTime(folderView);
			showFolderTable(folderView);
		},
		error : function() {
			$("#tb").html("<span class='graytext'>获取失败，请尝试刷新</span>");
			$("#publishTime").html("<span class='graytext'>获取失败，请尝试刷新</span>");
			$("#parentlistbox")
					.html("<span class='graytext'>获取失败，请尝试刷新</span>");
		}
	});
}

// 登录操作
function dologin() {
	var accountid = $("#accountid").val();
	var accountpwd = $("#accountpwd").val();
	var check = "y";
	if (accountid.length == 0) {
		$("#accountidbox").addClass("has-error");
		check = "n"
	} else {
		$("#accountidbox").removeClass("has-error");
	}
	if (accountpwd.length == 0) {
		$("#accountpwdbox").addClass("has-error");
		check = "n"
	} else {
		$("#accountpwdbox").removeClass("has-error");
	}
	if (check == "y") {
		$.ajax({
			type : "POST",
			dataType : "text",
			url : "homeController/doLogin.ajax",
			data : {
				accountid : accountid,
				accountpwd : accountpwd
			},
			success : function(result) {
				$("#alertbox").removeClass("alert");
				$("#alertbox").removeClass("alert-danger");
				$("#alertbox").text("");
				if (result == "permitlogin") {
					$("#accountidbox").removeClass("has-error");
					$("#accountpwdbox").removeClass("has-error");
					window.location.href = "home.jsp";
				} else if (result == "accountnotfound") {
					$("#accountidbox").addClass("has-error");
					$("#accountpwdbox").removeClass("has-error");
					$("#alertbox").addClass("alert");
					$("#alertbox").addClass("alert-danger");
					$("#alertbox").text("提示：登录失败，账户不存在或未设置");
				} else if (result == "accountpwderror") {
					$("#accountpwdbox").addClass("has-error");
					$("#accountidbox").removeClass("has-error");
					$("#alertbox").addClass("alert");
					$("#alertbox").addClass("alert-danger");
					$("#alertbox").text("提示：登录失败，密码错误或未设置");
				} else {
					$("#alertbox").addClass("alert");
					$("#alertbox").addClass("alert-danger");
					$("#alertbox").text("提示：无法登录，未知错误");
				}
			},
			error : function() {
				$("#alertbox").addClass("alert");
				$("#alertbox").addClass("alert-danger");
				$("#alertbox").text("提示：登录请求失败，请检查网络或服务器运行状态");
			}
		});
	}
}

// 注销操作
function dologout() {
	$('#logoutModal').modal('hide');
	window.location.href = "homeController/doLogout.do";
}

// 显示当前文件夹的父级路径
function showParentList(folderView) {
	$("#parentlistbox").html("");
	var f = folderView.folder;
	var index = 0;
	$.each(folderView.parentList, function(n, val) {
		if (index <= 6) {
			$("#parentlistbox").append(
					"<button onclick='entryFolder(" + '"' + val.folderId + '"'
							+ ")' class='btn btn-link btn-xs'>"
							+ val.folderName + "</button> / ");
			index++;
		} else {
		}
	});
	if (index > 6) {
		$("#parentlistbox").append("... / ");
	}
	$("#parentlistbox").append(f.folderName);
}

// 显示用户视图，包括文件列表、登录信息、操作权限接口等
function showAccountView(folderView) {
	$("#tb").html("");
	if (folderView.account != null) {
		// 说明已经等陆，显示注销按钮
		$("#tb")
				.append(
						"<button class='btn btn-link rightbtn' data-toggle='modal' data-target='#logoutModal'>注销 ["
								+ folderView.account
								+ "] <span class='glyphicon glyphicon-off' aria-hidden='true'></span></button>");
	} else {
		// 说明用户未登录，显示登录按钮
		$("#tb")
				.append(
						"<button class='btn btn-link rightbtn' data-toggle='modal' data-target='#loginModal'>登入<span class='glyphicon glyphicon-user' aria-hidden='true'></span></button>");
	}
	var authList = folderView.authList;
	if (authList != null) {
		if (checkAuth(authList, "C")) {
			$("#parentlistbox")
					.append(
							"<button onclick='showNewFolderModel()' class='btn btn-link btn-xs rightbtn'><span class='glyphicon glyphicon-folder-open'></span> 新建文件夹</button>");
		}
		if (checkAuth(authList, "U")) {
			$("#parentlistbox")
					.append(
							"<button onclick='showUploadFileModel()' class='btn btn-link btn-xs rightbtn'><span class='glyphicon glyphicon-cloud-upload'></span> 上传文件</button>");
		}
	}
}

// 检查权限列表
function checkAuth(authList, auth) {
	var k = false;
	$.each(authList, function(n, a) {
		if (a == auth) {
			k = true;
		}
	});
	return k;
}

// 显示视图更新时间
function showPublishTime(folderView) {
	$("#publishTime").html("");
	var pt = "";
	if (folderView.publishTime != null) {
		pt = folderView.publishTime;
	} else {
		pt = "--";
	}
	$("#publishTime").text(pt);
}

// 刷新文件夹视图
function refreshFolderView() {
	if (locationpath != null && locationpath.length > 0) {
		showFolderView(locationpath);
	} else {
		showFolderView('root');
	}
}

// 返回上一级文件夹
function returnPF() {
	if (parentpath != null && parentpath != "null") {
		showFolderView(parentpath);
	} else {
		showFolderView('root');
	}
}

// 显示文件夹内容
function showFolderTable(folderView) {
	$("#foldertable").html("");
	if (parentpath != null && parentpath != "null") {
		$("#foldertable")
				.append(
						"<tr><td><button onclick='returnPF()' class='btn btn-link btn-xs'>../</button></td><td>--</td><td>--</td><td>--</td><td>--</td></tr>");
	}
	var authList = folderView.authList;
	var aD = false;
	var aR = false;
	var aL = false;
	if (checkAuth(authList, "D")) {
		aD = true;
	}
	if (checkAuth(authList, "R")) {
		aR = true;
	}
	if (checkAuth(authList, "L")) {
		aL = true;
	}

	$
			.each(
					folderView.folderList,
					function(n, f) {
						var folderRow = "<tr><td><button onclick='entryFolder("
								+ '"' + f.folderId + '"'
								+ ")' class='btn btn-link btn-xs'>/"
								+ f.folderName + "</button></td><td>"
								+ f.folderCreationDate + "</td><td>--</td><td>"
								+ f.folderCreator + "</td><td>";
						if (aD) {
							folderRow = folderRow
									+ "<button onclick='showDeleteFolderModel("
									+ '"'
									+ f.folderId
									+ '","'
									+ f.folderName
									+ '"'
									+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-remove'></span> 删除</button>";
						}
						if (aR) {
							folderRow = folderRow
									+ "<button onclick='showRenameFolderModel("
									+ '"'
									+ f.folderId
									+ '","'
									+ f.folderName
									+ '"'
									+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-wrench'></span> 重命名</button>";
						}
						if (!aR && !aD) {
							folderRow = folderRow + "--";
						}
						folderRow = folderRow + "</td></tr>";
						$("#foldertable").append(folderRow);
					});
	$
			.each(
					folderView.fileList,
					function(n, fi) {
						var fileRow = "<tr><td>" + fi.fileName + "</td><td>"
								+ fi.fileCreationDate + "</td><td>"
								+ fi.fileSize + "MB</td><td>" + fi.fileCreator
								+ "</td><td>";
						if (aL) {
							fileRow = fileRow
									+ "<button onclick='showDownloadModel("
									+ '"'
									+ fi.fileId
									+ '","'
									+ fi.fileName
									+ '"'
									+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-cloud-download'></span> 下载</button>";
							// 对于各种特殊格式文件提供的预览和播放功能
							if (getSuffix(fi.fileName) == "mp4"
									|| getSuffix(fi.fileName) == "webm") {
								fileRow = fileRow
										+ "<button onclick='playVideo("
										+ '"'
										+ fi.fileId
										+ '"'
										+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-play'></span> 播放</button>";
							} else if (getSuffix(fi.fileName) == "pdf") {
								fileRow = fileRow
										+ "<button onclick='pdfView("
										+ '"'
										+ fi.fileId
										+ '"'
										+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-eye-open'></span> 预览</button>";
							} else if (getSuffix(fi.fileName) == "jpg"
									|| getSuffix(fi.fileName) == "jpeg"
									|| getSuffix(fi.fileName) == "gif"
									|| getSuffix(fi.fileName) == "png"
									|| getSuffix(fi.fileName) == "bmp") {
								fileRow = fileRow
										+ "<button onclick='showPicture("
										+ '"'
										+ fi.fileId
										+ '"'
										+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-picture'></span> 查看</button>";
							}
						}
						if (aD) {
							fileRow = fileRow
									+ "<button onclick='showDeleteFileModel("
									+ '"'
									+ fi.fileId
									+ '","'
									+ fi.fileName
									+ '"'
									+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-remove'></span> 删除</button>";
						}
						if (aR) {
							fileRow = fileRow
									+ "<button onclick='showRenameFileModel("
									+ '"'
									+ fi.fileId
									+ '"'
									+ ","
									+ '"'
									+ fi.fileName
									+ '"'
									+ ")' class='btn btn-link btn-xs'><span class='glyphicon glyphicon-wrench'></span> 重命名</button>";
						}
						if (!aR && !aD && !aL) {
							fileRow = fileRow + "--";
						}
						fileRow = fileRow + "</td></tr>";
						$("#foldertable").append(fileRow);
					});
}

// 显示新建文件夹模态框
function showNewFolderModel() {
	$("#foldername").val("");
	$('#newFolderModal').modal('toggle');
}

// 创建新的文件夹
function createfolder() {
	var fn = $("#foldername").val();
	var reg = new RegExp("^[0-9a-zA-Z_\\u4E00-\\u9FFF]+$", "g");
	if (fn.length == 0) {
		showFolderAlert("提示：文件夹名称不能为空。");
	} else if (fn.length > 20) {
		showFolderAlert("提示：文件夹名称太长。");
	} else if (reg.test(fn)) {
		$("#folderalert").removeClass("alert");
		$("#folderalert").removeClass("alert-danger");
		$("#foldernamebox").removeClass("has-error");
		$("#folderalert").text("");
		$.ajax({
			type : "POST",
			dataType : "text",
			data : {
				parentId : locationpath,
				folderName : fn
			},
			url : "homeController/newFolder.ajax",
			success : function(result) {
				if (result == "noAuthorized") {
					showFolderAlert("提示：您的操作未被授权，创建文件夹失败");
				} else if (result == "errorParameter") {
					showFolderAlert("提示：参数不正确，创建文件夹失败");
				} else if (result == "cannotCreateFolder") {
					showFolderAlert("提示：出现意外错误，可能未能创建文件夹");
				} else if (result == "folderAlreadyExist") {
					showFolderAlert("提示：该文件夹已经存在，请更换文件夹名称");
				} else if (result == "createFolderSuccess") {
					$('#newFolderModal').modal('hide');
					showFolderView(locationpath);
				} else {
					$('#newFolderModal').modal('hide');
					showFolderView(locationpath);
				}
			},
			error : function() {
				showFolderAlert("提示：出现意外错误，可能未能创建文件夹");
			}
		});
	} else {
		showFolderAlert("提示：文件夹名只能包含英文字母、数组、汉字和下划线。");
	}
}

// 显示新建文件夹状态提示
function showFolderAlert(txt) {
	$("#folderalert").addClass("alert");
	$("#folderalert").addClass("alert-danger");
	$("#foldernamebox").addClass("has-error");
	$("#folderalert").text(txt);
}

// 进入某一文件夹
function entryFolder(folderId) {
	showFolderView(folderId);
}

// 显示删除文件夹模态框
function showDeleteFolderModel(folderId, folderName) {
	$('#deleteFolderBox')
			.html(
					"<button id='dmbutton' type='button' class='btn btn-danger' onclick='deleteFolder("
							+ '"' + folderId + '"' + ")'>删除</button>");
	$("#dmbutton").attr('disabled', false);
	$('#deleteFolderMessage').text(
			"提示：确定要彻底删除文件夹：[" + folderName + "]及其全部内容么？该操作不可恢复");
	$('#deleteFolderModal').modal('toggle');
}

// 执行删除文件夹
function deleteFolder(folderId) {
	$("#dmbutton").attr('disabled', true);
	$('#deleteFolderMessage').text("提示：正在删除，请稍候...");
	$.ajax({
		type : "POST",
		dataType : "text",
		data : {
			folderId : folderId
		},
		url : "homeController/deleteFolder.ajax",
		success : function(result) {
			if (result == "noAuthorized") {
				$('#deleteFolderMessage').text("提示：您的操作未被授权，删除文件夹失败");
				$("#dmbutton").attr('disabled', false);
			} else if (result == "errorParameter") {
				$('#deleteFolderMessage').text("提示：参数不正确，删除文件夹失败");
				$("#dmbutton").attr('disabled', false);
			} else if (result == "cannotDeleteFolder") {
				$('#deleteFolderMessage').text("提示：出现意外错误，可能未能删除文件夹");
				$("#dmbutton").attr('disabled', false);
			} else if (result == "deleteFolderSuccess") {
				$('#deleteFolderModal').modal('hide');
				showFolderView(locationpath);
			} else {
				$('#deleteFolderMessage').text("提示：出现意外错误，可能未能删除文件夹");
				$("#dmbutton").attr('disabled', false);
			}
		},
		error : function() {
			$('#deleteFolderMessage').text("提示：出现意外错误，可能未能删除文件夹");
			$("#dmbutton").attr('disabled', false);
		}
	});
}

// 显示重命名文件夹模态框
function showRenameFolderModel(folderId, folderName) {
	$("#newfolderalert").removeClass("alert");
	$("#newfolderalert").removeClass("alert-danger");
	$("#folderrenamebox").removeClass("has-error");
	$("#newfolderalert").text("");
	$("#renameFolderBox").html(
			"<button type='button' class='btn btn-primary' onclick='renameFolder("
					+ '"' + folderId + '"' + ")'>修改</button>");
	$("#newfoldername").val(folderName);
	$("#renameFolderModal").modal('toggle');
}

function renameFolder(folderId) {
	var newName = $("#newfoldername").val();
	var reg = new RegExp("^[0-9a-zA-Z_\\u4E00-\\u9FFF]+$", "g");
	if (newName.length == 0) {
		showRenameFolderAlert("提示：文件夹名称不能为空。");
	} else if (newName.length > 20) {
		showRenameFolderAlert("提示：文件夹名称太长。");
	} else if (reg.test(newName)) {
		$("#newfolderalert").removeClass("alert");
		$("#newfolderalert").removeClass("alert-danger");
		$("#folderrenamebox").removeClass("has-error");
		$("#newfolderalert").text("");
		$.ajax({
			type : "POST",
			dataType : "text",
			data : {
				folderId : folderId,
				newName : newName
			},
			url : "homeController/renameFolder.ajax",
			success : function(result) {
				if (result == "noAuthorized") {
					showRenameFolderAlert("提示：您的操作未被授权，重命名失败");
				} else if (result == "errorParameter") {
					showRenameFolderAlert("提示：参数不正确，重命名失败");
				} else if (result == "cannotRenameFolder") {
					showRenameFolderAlert("提示：出现意外错误，可能未能重命名文件夹");
				} else if (result == "renameFolderSuccess") {
					$('#renameFolderModal').modal('hide');
					showFolderView(locationpath);
				} else {
					showRenameFolderAlert("提示：出现意外错误，可能未能重命名文件夹");
				}
			},
			error : function() {
				showRenameFolderAlert("提示：出现意外错误，可能未能重命名文件夹");
			}
		});
	} else {
		showRenameFolderAlert("提示：文件夹名只能包含英文字母、数组、汉字和下划线");
	}
}

// 显示重命名文件夹状态提示
function showRenameFolderAlert(txt) {
	$("#newfolderalert").addClass("alert");
	$("#newfolderalert").addClass("alert-danger");
	$("#folderrenamebox").addClass("has-error");
	$("#newfolderalert").text(txt);
}

// 显示上传文件模态框
function showUploadFileModel() {
	$("#umbutton").attr('disabled', false);
	$("#uploadfile").val("");
	$("#filepath").val("");
	$("#pros").width("0%");
	$("#uploadFileAlert").removeClass("alert");
	$("#uploadFileAlert").removeClass("alert-danger");
	$("#uploadFileAlert").text("");
	$('#uploadFileModal').modal('toggle');
}

// 点击文本框触发input:file选择文件动作
function checkpath() {
	$('#uploadfile').click();
}

// 文件选中后自动回填文件路径
function showfilepath() {
	var fp = $("#uploadfile").val();
	$("#filepath").val(fp);
}

// 检查是否能够上传
function checkUploadFile() {

	$("#umbutton").attr('disabled', true);

	$("#uploadFileAlert").removeClass("alert");
	$("#uploadFileAlert").removeClass("alert-danger");
	$("#uploadFileAlert").text("");

	var filename = $("#filepath").val().replace(/^.+?\\([^\\]+?)?$/gi, "$1");

	$.ajax({
		type : "POST",
		dataType : "text",
		data : {
			folderId : locationpath,
			filename : filename
		},
		url : "homeController/checkUploadFile.ajax",
		success : function(result) {
			if (result == "errorParameter") {
				showUploadFileAlert("提示：参数不正确，无法开始上传");
			} else if (result == "noAuthorized") {
				showUploadFileAlert("提示：您的操作未被授权，无法开始上传");
			} else if (result == "duplicationFileName") {
				showUploadFileAlert("提示：存在重命名文件，无法开始上传");
			} else if (result == "permitUpload") {
				doupload();
			} else {
				showUploadFileAlert("提示：出现意外错误，无法开始上传");
			}
		},
		error : function() {
			showUploadFileAlert("提示：出现意外错误，无法开始上传");
		}
	});
}

var xhr;

// 执行文件上传并实现上传进度显示
function doupload() {

	$("#pros").width("0%");// 先将进度条置0

	var uploadfile = $("#uploadfile").get(0).files[0];// 获取要上传的文件

	if (uploadfile != null) {
		xhr = new XMLHttpRequest();// 这东西类似于servlet里面的request

		var fd = new FormData();// 用于封装文件数据的对象

		fd.append("file", uploadfile);// 将文件对象添加到FormData对象中，字段名为uploadfile
		fd.append("folderId", locationpath);

		xhr.open("POST", "homeController/douploadFile.ajax", true);// 上传目标

		xhr.upload.addEventListener("progress", uploadProgress, false);// 这个是对上传进度的监听
		// 上面的三个参数分别是：事件名（指定名称）、回调函数、是否冒泡（一般是false即可）

		xhr.send(fd);// 上传FormData对象

		// 上传结束后执行的回调函数
		xhr.onloadend = function() {
			if (xhr.status === 200) {
				// TODO 上传成功
				var result = xhr.responseText;
				if (result == "uploadsuccess") {
					$('#uploadFileModal').modal('hide');
					$("#umbutton").attr('disabled', false);
					showFolderView(locationpath);
				} else if (result == "uploaderror") {
					showUploadFileAlert("提示：出现意外错误，上传失败");
				} else {
					$('#uploadFileModal').modal('hide');
				}
			} else {
				showUploadFileAlert("提示：出现意外错误，上传失败");
			}
		};
	} else {
		showUploadFileAlert("提示：未选择任何文件");
	}
}

function uploadProgress(evt) {
	if (evt.lengthComputable) {
		// evt.loaded：文件上传的大小 evt.total：文件总的大小
		var percentComplete = Math.round((evt.loaded) * 100 / evt.total);
		// 加载进度条，同时显示信息
		$("#pros").width(percentComplete + "%");
	}
}

// 显示上传文件状态提示
function showUploadFileAlert(txt) {
	$("#uploadFileAlert").addClass("alert");
	$("#uploadFileAlert").addClass("alert-danger");
	$("#uploadFileAlert").text(txt);
	$("#umbutton").attr('disabled', false);
}

// 显示下载文件模态框
function showDownloadModel(fileId, fileName) {
	$("#downloadModal").modal('toggle');
	$("#downloadFileName").text("提示：您确认要下载文件：[" + fileName + "]么？");
	$("#downloadFileBox")
			.html(
					"<button id='dlmbutton' type='button' class='btn btn-primary' onclick='dodownload("
							+ '"' + fileId + '"' + ")'>开始下载</button>");
	$("#dlmbutton").attr('disabled', false);
}

// 执行下载操作
function dodownload(fileId) {
	$("#dlmbutton").attr('disabled', true);
	$("#downloadFileName").text("提示：准备开始下载，请稍候...");
	var t = setTimeout("$('#downloadModal').modal('hide');", 800);
	window.location.href = "homeController/downloadFile.do?fileId=" + fileId;
}

// 显示删除文件模态框
function showDeleteFileModel(fileId, fileName) {
	$('#deleteFileBox')
			.html(
					"<button id='dfmbutton' type='button' class='btn btn-danger' onclick='deleteFile("
							+ '"' + fileId + '"' + ")'>删除</button>");
	$("#dfmbutton").attr('disabled', false);
	$('#deleteFileMessage').text("提示：确定要彻底删除文件：[" + fileName + "]么？该操作不可恢复");
	$('#deleteFileModal').modal('toggle');
}

// 执行删除文件操作
function deleteFile(fileId) {
	$("#dfmbutton").attr('disabled', true);
	$('#deleteFileMessage').text("提示：正在删除，请稍候...");
	$.ajax({
		type : "POST",
		dataType : "text",
		data : {
			fileId : fileId
		},
		url : "homeController/deleteFile.ajax",
		success : function(result) {
			if (result == "noAuthorized") {
				$('#deleteFileMessage').text("提示：您的操作未被授权，删除失败");
				$("#dfmbutton").attr('disabled', false);
			} else if (result == "errorParameter") {
				$('#deleteFileMessage').text("提示：参数不正确，删除失败");
				$("#dfmbutton").attr('disabled', false);
			} else if (result == "cannotDeleteFile") {
				$('#deleteFileMessage').text("提示：出现意外错误，可能未能删除文件");
				$("#dfmbutton").attr('disabled', false);
			} else if (result == "deleteFileSuccess") {
				$('#deleteFileModal').modal('hide');
				showFolderView(locationpath);
			} else {
				$('#deleteFileMessage').text("提示：出现意外错误，可能未能删除文件");
				$("#dfmbutton").attr('disabled', false);
			}
		},
		error : function() {
			$('#deleteFileMessage').text("提示：出现意外错误，可能未能删除文件");
			$("#dfmbutton").attr('disabled', false);
		}
	});
}

// 显示重命名文件模态框
function showRenameFileModel(fileId, fileName) {
	$("#newFileNamealert").removeClass("alert");
	$("#newFileNamealert").removeClass("alert-danger");
	$("#filerenamebox").removeClass("has-error");
	$("#newFileNamealert").text("");
	$("#renameFileBox").html(
			"<button type='button' class='btn btn-primary' onclick='renameFile("
					+ '"' + fileId + '"' + ")'>修改</button>");
	$("#newfilename").val(fileName);
	$("#renameFileModal").modal('toggle');
}

// 修改文件名
function renameFile(fileId) {
	var reg = new RegExp("[\/\|\\s\\\\\*\\<\\>" + '"' + "]+", "g");
	var newFileName = $("#newfilename").val();
	if (newFileName.length > 0) {
		if (newFileName.length < 128) {
			if (!reg.test(newFileName)) {
				$.ajax({
					type : "POST",
					dataType : "text",
					data : {
						fileId : fileId,
						newFileName : newFileName
					},
					url : "homeController/renameFile.ajax",
					success : function(result) {
						if (result == "cannotRenameFile") {
							showRenameFolderAlert("提示：出现意外错误，可能未能重命名文件");
						} else if (result == "renameFileSuccess") {
							$('#renameFileModal').modal('hide');
							showFolderView(locationpath);
						} else if (result == "errorParameter") {
							showRenameFolderAlert("提示：参数错误，重命名失败");
						} else if (result == "noAuthorized") {
							showRenameFolderAlert("提示：您的操作未被授权，重命名失败");
						} else {
							showRenameFolderAlert("提示：出现意外错误，可能未能重命名文件");
						}
					},
					error : function() {
						showRenameFolderAlert("提示：出现意外错误，可能未能重命名文件");
					}
				});
			} else {
				showRenameFolderAlert("提示：文件名中不应含有：空格 引号 / \ * | < > ");
			}
		} else {
			showRenameFolderAlert("提示：文件名称太长");
		}
	} else {
		showRenameFolderAlert("提示：文件名不能为空");
	}
}

// 显示重命名文件状态提示
function showRenameFolderAlert(txt) {
	$("#newFileNamealert").addClass("alert");
	$("#newFileNamealert").addClass("alert-danger");
	$("#filerenamebox").addClass("has-error");
	$("#newFileNamealert").text(txt);
}

// 取消上传
function abortUpload() {
	if (xhr != null) {
		xhr.abort();
	}
	$('#uploadFileModal').modal('hide');
}

// 获取文件名的后缀名，以小写形式输出
function getSuffix(filename) {
	var index1 = filename.lastIndexOf(".");
	var index2 = filename.length;
	var suffix = filename.substring(index1 + 1, index2);
	return suffix.toLowerCase();
}

// 播放指定格式的视频
function playVideo(fileId) {
	window.open("homeController/playVideo.do?fileId=" + fileId);
}

// 预览PDF文档
function pdfView(fileId) {
	window.open("homeController/pdfView.do?fileId=" + fileId);
}

// 查看图片
function showPicture(fileId) {
	window.open("homeController/showPicture.do?fileId=" + fileId);
}