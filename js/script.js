"use strict"

// стандартная проверка на то, что документ уже загружен
document.addEventListener('DOMContentLoaded', function () {
   const form = document.getElementById('form');
   form.addEventListener('submit', form_submit); // при отправке формы переходим в функцию formSend
   
   async function form_submit(e) {
      // запрещаем стандартную отправку формы, т.е. теперь при нажатии на кнопку ничего не будет происходить
      e.preventDefault();

      let error = form_validate(form);

      // эта строка при помощи FormData вытягивает все данные полей
      let formData = new FormData(form);
      // а здесь добавляем туда еще и изображение
      formData.append('image', formImage.files[0]);

      if (error === 0) {
         // если ошибок в валидации нет, сразу добавляем к форме класс ._sending (и по этому классу будем что-то делать)
         form.classList.add('_sending');
         let response = await fetch('sendmail.php', {
            method: 'POST',
            headers: {
               "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH",
            },
            body: formData
         });
         if (response.ok) {
            let result = await response.json();
            alert(result.message);
            // при отправке очищаем данные заполненной формы
            // очищаем див с превью изображения
            formPreview.innerHTML = '';
            // очищаем все поля формы
            form.reset();
            form.classList.remove('_sending');
         } else {
            alert("Ошибка");
            form.classList.remove('_sending');
         }
      } else {
         alert('Заполните обязательные поля');
      }
   }

   // делаем простую валидацию форм (поля, обязательные к заполнению + правильность e-mail)
   function form_validate(form) {
      let error = 0;
      let form_req = form.querySelectorAll('._req');
      
		for (let index = 0; index < form_req.length; index++) {
         const input = form_req[index];
         // теперь, каждый раз, когда мы будем приступать к проверке формы, нам нужно изначально убрать у объекта класс .error
         form_remove_error(input);
         // начнем с проверки e-mail
         // Метод Node.contains() возвращает Boolean значение, указывающее, является ли узел потомком данного узла, т. е. сам узел, один из его прямых потомков ( childNodes ), один из детей его детей и так далее.
         if (input.classList.contains('_email')) {
            //  если тест не пройдет, то добавляем класс .error объекту и его родителю + плюс будем увеличивать переменную error на единицу
            if(email_test(input)){
               form_add_error(input);
               error++;
            }
         } else if(input.getAttribute("type") == "checkbox" && input.checked == false) {
            // проверяем наличие checkbox`a (у инпута есть тип = чекбокс и этот чекбокс включен)
            form_add_error(input);
            error++;
         } else {
            // заполнено ли поле вообще
            if (input.value === '') {
               form_add_error(input);
               error++;
            }
         }			
      }
      return error;
   }

   // создаем еще 2 вспомогательные функции - formAddError и formRemoveError
   function form_add_error(input) {
      input.classList.add('_error'); // добавляет самому объекту класс
      input.parentElement.classList.add('_error'); // и родительскому объекту тоже

   }
   function form_remove_error(input) {
      input.classList.remove('_error'); // здесь соответственно этот класс убирается
      input.parentElement.classList.remove('_error');

   }
   // email_test
   function email_test(input) {
      return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
   }

   // Получаем инпут file в переменную
   const formImage = document.getElementById('formImage');
   // Получаем див для превью в переменную
   const formPreview = document.getElementById('formPreview');

   // Слушаем изменени в инпуте file
   formImage.addEventListener('change', () => {
      uploadFile(formImage.files[0]);
   });

   function uploadFile(file) {
      // проверяем тип файла
      if (!['image/jpeg', 'image/png', 'image/ gif'].includes(file.type)) {
         alert('Разрешены только изображения.');
         formImage.value = '';
         return;
      }
      // проверим размер файла (<2 Мб)
      if (file.size > 2 * 1024 * 1024) {
         alert('Файл должен быть менее 2 МБ.');
         return;
      }

      let reader = new FileReader();
      // когда файл успешно загружен, мы отправляем изображение (src которого будет полученный результат загрузки файла) и помещаем его внутрь дива #formPreview
      reader.onload = function (e) {
         formPreview.innerHTML = `<img src="${e.target.result}" alt="Фото">`;
      };
      reader.onerror = function (e) {
         alert('Ошибка');
      };
      // продолжаем работу
      reader.readAsDataURL(file);
   }
});