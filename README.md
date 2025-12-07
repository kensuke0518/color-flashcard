# 自動デプロイの仕組み

`npm run deploy`  
  
上記を行うとCloudeFlareに自動デプロイされる  
CloudeFlareとGithubは今回は連携していない  
理由は連携から行おうとするとwrangler起因？のerror code 10021が出てしまい、いつまでもデプロイできないから  
  
https://zenn.dev/ak/articles/a2bd28a258b615  
上記のサイトを参考にCloudflare Workersを先に`npm create`して、デプロイしてから、アプリの作成を行った。