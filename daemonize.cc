/*
* Daemonize
*/

#include <v8.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <ev.h>

#define PID_MAXLEN 10

using namespace v8;

// Become a daemon.
// if successful, returns daemon's PID, 0 otherwise
Handle<Value> Start(const Arguments& args) {
  if(!args[0]->IsString())
    return Integer::New(0);
    
  pid_t pid, sid;
  
  pid = fork();
  if(pid > 0) exit(0);
  if(pid < 0) exit(1);
  
  ev_default_fork();
  
  sid = setsid();
  if(sid < 0) exit(1);
  
  String::Utf8Value data(args[0]->ToString());
  char pid_str[PID_MAXLEN+1];
  
  int lfp = open(*data, O_RDWR | O_CREAT, 0640);
  if(lfp < 0) exit(1);
  if(lockf(lfp, F_TLOCK, 0) < 0) exit(0);
  
  int len = snprintf(pid_str, PID_MAXLEN, "%d", getpid());
  write(lfp, pid_str, len);
  
  return Integer::New(getpid());
}

// Close Standard Streams
Handle<Value> CloseIO(const Arguments& args) {
  freopen( "/dev/null", "r", stdin);
  freopen( "/dev/null", "w", stdout);
  freopen( "/dev/null", "w", stderr);
}

extern "C" void init(Handle<Object> target) {
  HandleScope scope;
  
  target->Set(String::New("start"), FunctionTemplate::New(Start)->GetFunction());
  target->Set(String::New("closeIO"), FunctionTemplate::New(CloseIO)->GetFunction());
}
