

export class VidiunAPIException{
    code : string;
    message : string;

    static isMatch(response : any) : boolean
    {
        return response && response.objectType === "VidiunAPIException";
    }

    static create(response : any) : VidiunAPIException{
        let result : VidiunAPIException = null;
        if (VidiunAPIException.isMatch(response)){
            result = new VidiunAPIException();
            result.code = response.code;
            result.message = response.message;
        }

        return result;
    }
}