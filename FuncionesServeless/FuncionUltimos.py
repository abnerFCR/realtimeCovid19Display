import redis
import hiredis

def hello_world(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    pool = redis.ConnectionPool(host="35.239.202.172", port=6379, password = "ContraSOPES1", db=0, decode_responses = True)
    r = redis.Redis(connection_pool = pool)
    
    val = redis.Redis.lrange(r,"lista",0,4)
    retorno = val[0]+"\n"+val[1]+"\n"+val[2]+"\n"+val[3]+"\n"+val[4]

    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    return (retorno, 200, headers)
