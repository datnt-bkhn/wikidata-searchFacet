app.factory('exceptionManager',function(){

    var exceptionManager=function(error,code,errorMessage)
    {
        this.code=code;
        this.error=error;
        this.errorMessage=errorMessage;//message printed to user
    };

    exceptionManager.prototype.getMessage=function(){
        return this.errorMessage;
    };

    return exceptionManager;
})