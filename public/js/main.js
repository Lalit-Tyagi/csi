
(function ($) {
	"use strict";

	$(function () {
		var header = $(".start-style");
		$(window).scroll(function () {
			var scroll = $(window).scrollTop();

			if (scroll >= 50) {
				header.removeClass('start-style').addClass("scroll-on");
			} else {
				header.removeClass("scroll-on").addClass('start-style');
			}
		});
	});
	//nav bar height animation
	let toggleHeight = $(window).outerHeight();

	$(window).scroll(() => {
		if ($(window).scrollTop() > toggleHeight) {
			$(".m-backtotop").addClass("active");
		} else {
			$(".m-backtotop").removeClass("active");
		}
	});

	//navbar auto close on lossing focus
	$(document).click(function (event) {
		var clickover = $(event.target);
		var _opened = $(".navbar-collapse").hasClass("show");
		if (_opened === true && !clickover.hasClass("navbar-toggler")) {
			$(".navbar-toggler").click();
		}
	});
	//navbar autoclose on scroll
	$(document).scroll(function (event) {
		var clickover = $(event.target);
		var _opened = $(".navbar-collapse").hasClass("show");
		if (_opened === true && !clickover.hasClass("navbar-toggler")) {
			$(".navbar-toggler").click();
		}
	});

	$('body').on('mouseenter mouseleave', '.nav-item', function (e) {
		if ($(window).width() > 750) {
			var _d = $(e.target).closest('.nav-item'); _d.addClass('show');
			setTimeout(function () {
				_d[_d.is(':hover') ? 'addClass' : 'removeClass']('show');
			}, 1);
		}
	});
	//Scrolls the user to the top of the page again
	$(".m-backtotop").click(() => {
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return true;
	});

	$('.mainframe')
		.on('mouseover', function () {
			$(this).children('img').css({
				'transform': 'scale(1.5)'
			});
		})
		.on('mouseout', function () {
			$(this).children('img').css({
				'transform': 'scale(1)'
			});
		})
		.on('mousemove', function (e) {
			$(this).children('img').css({
				'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 + '%'
			});
		});
	$('div.subframe').on('click', function () {
		var imgadd = $(this).children('img').attr('src');
		$('div.subframe').removeClass('active');
		$(this).addClass('active');
		$('div.mainframe').children('img').attr('src', imgadd);
	});

})(jQuery);

// async subscribe form submission
$("#subscribe-form").submit((e) => {
	e.preventDefault();
	const form = e.target;
	const data = new FormData(form);
	let formObj = {};
	for (let pair of data.entries()) {
		formObj[pair[0]] = pair[1]
	}
	fetch(form.action, {
		method: form.method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formObj)
	})
		.then(res => res.json())
		.then(data => {
			console.log(data.success);
			if (data.success) {
				$('#subscribe-form').addClass('d-none');
				$('#success-circle').removeClass('d-none');
			} else {
				$('#faliure-circle').removeClass('d-none');
			}
		});
});

//asyn contact form submission

$('#contact-form').submit((e) => {
	e.preventDefault();
	$('.pre-state').addClass('d-none');
	$('.active-state').removeClass('d-none');
	$('.final-state').addClass('d-none');
	$('.err-state').addClass('d-none');
	const form = e.target;
	const data = new FormData(form);
	let formObj = {};
	for (let pair of data.entries()) {
		formObj[pair[0]] = pair[1]
	}
	setTimeout(() => {
		fetch(form.action, {
			method: form.method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formObj)
		})
			.then(res => res.json())
			.then(data => {
				console.log(data.success);
				if (data.success) {
					$('.pre-state').addClass('d-none');
					$('.active-state').addClass('d-none');
					$('.final-state').removeClass('d-none');
					$('.err-state').addClass('d-none');
				} else {
					$('.pre-state').addClass('d-none');
					$('.active-state').addClass('d-none');
					$('.final-state').addClass('d-none');
					$('.err-state').removeClass('d-none');
					setTimeout(() => {
						$('.pre-state').removeClass('d-none');
						$('.active-state').addClass('d-none');
						$('.final-state').addClass('d-none');
						$('.err-state').addClass('d-none');
					}, 1500);
				}

				$('#userName').val('');
				$('#userMessage').val('');
				$('#userEmail').val('');


			});
	}, 1000);

});
/*image preview */
$(() => {
	var imagesPreview = function (input, placeToInsertImagePreview, i) {

		if (input.files) {
			var reader = new FileReader();
			reader.onload = function (event) {
				placeToInsertImagePreview.attr('src', event.target.result)
			}
			if (input.files[i]) {
				reader.readAsDataURL(input.files[i]);
			}
		}

	};

	$('#main-image-upload').on('change', function () {
		imagesPreview(this, $('#main-image-0'), 0);
	});

	$('#images-upload').on('change', function () {
		imagesPreview(this, $('#image-0'), 0);
		imagesPreview(this, $('#image-1'), 1);
		imagesPreview(this, $('#image-2'), 2);
	});
});

$('#filter').on('change', () => {

	fetch(`/manage/product/${document.getElementById('filter').value}`)
		.then(res => res.json())
		.then(data => {
			$('#root').html('')
			var htmlcount = `<div class="w-100 text-center mb-4"><h3>Product Count : ${data.result.length}</h3><div>`
			$('#root').append(htmlcount)
			for (let i = 0; i < data.result.length; i++) {
				let product = data.result[i];
				let htmlString = `
				<div class="col-sm-6">
					<div class="card mb-3 shadow">
						<div class="row no-gutters">
							<div class="col-md-4 d-flex align-items-center">
								<img src="${product.img_path}" class="card-img img-fluid" alt="">
							</div>
							<div class="col-md-8 d-flex flex-column">
								<div class="card-body">
									<h5 class="card-title">${product.name} </h5>
									<p class="card-text"><b>Style No : </b>${product.style_no} </p>
									<p class="card-text"><b>Category : </b>${product.category} </p>
									<p class="card-text"><b>Popularity : </b>${product.popularity} </p>
									
									<p class="card-text overflow-hidden" style="height:50px">${product.description} </p>
									
								</div>
								<div class="justify-content-center align-self-end mx-auto mb-3">
									<a href="/manage/product/${product.style_no}/edit" class="btn btn-outline-info mr-1">Edit</a>
									<a href="/manage/product/${product.style_no}/delete" class="btn btn-outline-danger ml-1">Delete</a>
								</div>
							</div>
						</div>
					</div>
				</div>`;
				$('#root').append(htmlString);
			}

		});
})

$('#search-form').submit((e) => {
	e.preventDefault()
	console.log($('#search-box').val())
	fetch('/manage/product/search?' + new URLSearchParams({
		q: $('#search-box').val()
	})).then(res => res.json())
		.then(data => {
			$('#root').html('')
			var htmlcount = `<div class="w-100 text-center mb-4"><h3>Product Count : ${data.result.length}</h3><div>`
			$('#root').append(htmlcount)
			for (let i = 0; i < data.result.length; i++) {
				let product = data.result[i];
				let htmlString = `
			<div class="col-sm-6">
				<div class="card mb-3 shadow">
					<div class="row no-gutters">
						<div class="col-md-4 d-flex align-items-center">
							<img src="${product.img_path}" class="card-img img-fluid" alt="">
						</div>
						<div class="col-md-8 d-flex flex-column">
							<div class="card-body">
								<h5 class="card-title">${product.name} </h5>
								<p class="card-text"><b>Style No : </b>${product.style_no} </p>
								<p class="card-text"><b>Category : </b>${product.category} </p>
								<p class="card-text"><b>Popularity : </b>${product.popularity} </p>
								
								<p class="card-text overflow-hidden" style="height:50px">${product.description} </p>
								
							</div>
							<div class="justify-content-center align-self-end mx-auto mb-3">
								<a href="/manage/product/${product.style_no}/edit" class="btn btn-outline-info mr-1">Edit</a>
								<a href="/manage/product/${product.style_no}/delete" class="btn btn-outline-danger ml-1">Delete</a>
							</div>
						</div>
					</div>
				</div>
			</div>`;
				$('#root').append(htmlString);
			}

		});
})

$('.customcheckbox').on('change', function () {
	let data = {
		id: this.value,
		state: this.checked
	}
	fetch(`/manage/messages/update`, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				$(this).parent().parent().toggleClass('bg-read');
			} else {
				$(this).attr('checked', false);
			}
		});
});

$('.del-btn').on('click', function () {
	$(this).parent().parent().addClass('bg-danger');
	setTimeout(() => {
		fetch(`/manage/messages/del/${this.value}`)
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					$(this).parent().parent().remove();
				} else {
					$(this).parent().parent().removeClass('bg-danger');
				}
			});
	}, 500);

});
$('.manager-del-btn').on('click', function () {
	$(this).parent().parent().addClass('bg-danger');
	setTimeout(() => {
		fetch(`/admin/manager/del/${this.value}`)
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					$(this).parent().parent().remove();
				} else {
					$(this).parent().parent().removeClass('bg-danger');
				}
			});
	}, 500);

});

$('.sub-del-btn').on('click', function () {
	$(this).parent().parent().addClass('bg-danger');
	setTimeout(() => {
		fetch(`/manage/subscribers/del/${this.value}`)
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					$(this).parent().parent().remove();
				} else {
					$(this).parent().parent().removeClass('bg-danger');
				}
			});
	}, 500);

});

$('button.more').on('click', () => {
	$('span#more').removeClass('d-none');
	$('span#dots').addClass('d-none');
});

$('button.less').on('click', () => {
	$('span#more').addClass('d-none');
	$('span#dots').removeClass('d-none');
});

$('li.pageNumber').on('click', (event) => {
	$('li.pageNumber').removeClass('active');
	$(event.target).addClass('active');
	$('div.page').addClass('d-none');
	let liID = "#" + $(event.target).attr('value');
	console.log(liID)
	$(liID).removeClass('d-none')
})


//prouct upload file to limit file size upload
var maxImageSize = 250 * 1024;

var mainImageInput = document.getElementById("main-image-upload")
mainImageInput.onchange = () => {
	if (mainImageInput.files[0].size > maxImageSize) {
		alert("File is too big!")
		mainImageInput.value = ""
	};
};

var imagesUploadInput = document.getElementById('images-upload')
imagesUploadInput.onchange = () => {
	var images = imagesUploadInput.files
	for (var i = 0; i < 3; i++) {
		if (images[i].size > maxImageSize) {
			alert('file is to big!!')
			imagesUploadInput.value = "";
			$('#image-2').attr('src', '/public/img/dummy.jpg')
			$('#image-1').attr('src', '/public/img/dummy.jpg')
			$('#image-0').attr('src', '/public/img/dummy.jpg')
		}
	}
}