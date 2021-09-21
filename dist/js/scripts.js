
$(".success__Box").hide();
$(".success__Message").hide();

/* -------------------------------------------------------------------------- */
/*                               CHECKBOX LOGIC                               */
/* -------------------------------------------------------------------------- */

/*
$('.js-year').on('change', function () {
    
    $year = $(this).val();
    console.log(year)
    if ($(this).is(':selected')) {
        $('.subForm__' + $year).show();

        // $('#mudanzaGrupa-' + year).off('change');
        $('#mudanzaGrupa-' + $year).on('change', function (){
            $(this).parents('.js-sub-form').find('.cuantasMudanza').toggle();
            $(this).parents('.js-sub-form').find('.subForm__participa').toggle();
            // $('.cuantasMudanza-' + $year).toggle();
            // $('.subForm__participa-' + $year).toggle();
        });
        // $('#participaGrupa-' + year).off('chage');
        $('#participaGrupa-' + $year).on('change', function () {
            $(this).parents('.js-sub-form').find('.dondeGrupa').toggle();
        });
    } else {
        $('.subForm__' + $year).hide();
    }

// 1. Agregamos si operan en otra provincia (SI/NO, no por deafult)
// 2. Cambiar la seccion de años a "Año en el que se funda la grupa", y "Año de cese de actividades" (o sugerime otro titulo), y que cree 1 sub form por cada año entre medio.
// 3. Al hacer enviar, pregunta si esta seguro que la grupa opera desde inicio a fin.
// 4. Agregar un campo de notas no requerido al final, entre los años y el boton de enviar.
5. Que al hacer enviar, valide que:
//   a. Nombre de la grupa no sea vacio
//   b. Provincia Tenga algun valor seleccionado
//   c. para cada año visible que la cantidad de personas sea mayor a 0, y la localidad tenga algun valor seleccionado.


});

*/

/* -------------------------------------------------------------------------- */
/*                                SELECT LOGIC                                */
/* -------------------------------------------------------------------------- */

function disableForms(){
    for (let i = 2012; i < 2021; i++) {
        $('.subForm__' + i).hide();
        $('.subForm__' + i).find('input').prop('disabled', true);
    }
}

$('.fechaGrupa').on('change', function(){

    $fundaYear = $('#fundaGrupa').val();
    $ceseYear = $('#ceseGrupa').val();

    disableForms();

    for (let i = $fundaYear; i <= $ceseYear; i++) {
        $('.subForm__' + i).show();
        $('.subForm__' + i).find('input').prop('disabled', false);
        $('#mudanzaGrupa-' + i).on('change', function (){
            $(this).parents('.js-sub-form').find('.cuantasMudanza').toggle();
            $(this).parents('.js-sub-form').find('.subForm__participa').toggle();
            
        });
        $('#participaGrupa-' + i).on('change', function () {
            $(this).parents('.js-sub-form').find('.dondeGrupa').toggle();
        });
        
    }
})

/* -------------------------------------------------------------------------- */
/*                               PROVINCE LOGIC                               */
/* -------------------------------------------------------------------------- */

$('.js-province-list').on('change', function(){
    $province = $('.js-province-list').val()
    if ($province != '') {
        var jqxhr = $.get( "https://apis.datos.gob.ar/georef/api/departamentos?max=900&provincia=" + $province, function() {
        
        })
            .done(function(data) {
                $list = $('.js-municpios-list')
                departamentos = []
                $.each(data.departamentos, function() {
                    departamentos.push({id: this.id, nombre: this.nombre})
                });

                departamentos.sort(function(a,b){
                    if(a.id > b.id){ return 1}
                     if(a.id < b.id){ return -1}
                       return 0;
                 });
                $list.empty();
                $.each(departamentos, function() {
                    $list.append($("<option />").val(this.nombre).text(this.nombre));
                })
            })
            .fail(function() {
            alert( "error" );
            });   
    }
});

/* -------------------------------------------- */
/*           Form Submit logic                  */
/* -------------------------------------------- */
function defaultJsonData(){
    return {
        integrantes: '', 
        usuarios_mudaron: '', 
        catidad_mudanza:'', 
        mudados_siguen_participando:'', 
        mudados_siguen_participando_donde: '', 
        base_grupa: '', 
        otras_zonas: ''
    };
}

function yearChecked(year){
    $fundaYear = $('#fundaGrupa').val();
    $ceseYear = $('#ceseGrupa').val();
    
    return ($fundaYear <= year) && ( $ceseYear >= year);
}

function yearJson(year) {
    yearData = defaultJsonData();

    if (yearChecked(year)) {
        yearData['integrantes'] = $('.subForm__' + year).find('[name=integrantesGrupa]').val();
        yearData['usuarios_mudaron'] = $('.subForm__' + year).find('[name=mudanzaGrupa]').val();
        yearData['catidad_mudanza'] = $('.subForm__' + year).find('[name=cuantasMudanza]').val();
        yearData['mudados_siguen_participando'] = $('.subForm__' + year).find('[name=sigue_participando]').val();
        yearData['mudados_siguen_participando_donde'] = $('.subForm__' + year).find('[name=dondeGrupa]').val();
        yearData['base_grupa'] = $('.subForm__' + year).find('[name=baseGrupa]').val();
        yearData['otras_zonas'] = $('.subForm__' + year).find('[name=actuoGrupa]').val().join(', ');
    }
    return yearData;
}

function submitForm() {
    data = {
        grupa: {
            nombre: $('#name').val(), 
            provincia: $('#province option:selected').text(), 
            opera_otra_provincia: $("#operanProvincia").val(),
            notas: $("#notas").val(),
            years:[]
        }
    };
    for (let i = 2012; i < 2021; i++){
        year = {year: i, data: yearJson(i)}
        data['grupa']['years'].push(year)
    }
    // return data;

    jQuery.ajax({
        type: 'POST',
        url: 'https://encuesta-grupa.herokuapp.com/grupas',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(json) { }
      });
}

$("form").on('submit', function( event ) { 
    
    if(confirm('Esta segura que la grupa opera desde ' +$fundaYear+ ' hasta ' +  $ceseYear + '?')) {
        data = submitForm(this);
        // console.log(data)
        event.preventDefault();
    
        $("form").empty();
        
        $(".success__Box").show();
        $(".success__Message").show();
        return true
    }else{
        return false
    }
});
$(document).on('ready', function(){
    $("#form").trigger("reset");
    disableForms();
})