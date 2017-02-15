
# coding: utf-8

# # 台灣公司資料
# 
# * 抓取檔案來自[台灣公司資料](http://company.g0v.ronny.tw/)
# * 欄位定義看[這邊](http://company.g0v.ronny.tw/index/columns)
# * 資料下載位置在[這裡](http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/index.html)

# %%




#==============================================================================
# 下載資料
#==============================================================================
def download_gz(file_indexes,path='../data/'):
    ## 大型公司資料 00000000.json.gz 
    url = 'http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/' 
    for item in file_indexes:
        url_data = url + item + '.jsonl.gz'
        res = requests.get(url_data)
        storage_path = path + item + '.jsonl.gz'
        with open(storage_path,'wb') as handle:
            if not res.ok:
                print('oops, something wrong!')
            else:
                for block in res.iter_content(1024):
                    handle.write(block)
                print('{} is downloaded'.format(item+'.jsonl.gz'))
    ## 小企業資料 business-00000000.json.gz
    for item in file_indexes:
        file_path = 'bussiness-' + item + '.jsonl.gz'
        url_data = url + file_path
        res = requests.get(url_data)
        storage_path = path + file_path        
        with open(storage_path,'wb') as handle:
            if not res.ok:
                print('oops, something wrong')
            else:
                for block in res.iter_content(1024):
                    handle.write(block)        
                print('{} is downloaded'.format(file_path))



 
#==============================================================================
# ## 整理.gz檔案(json)與存入SQL-server
#==============================================================================



def get_company_info_str(data):
    '''合併所營事業資料成string
    '''
    if data:
        temp_info = ''
        for e in data:
            for j in e:                
                temp_info += '/'+j
        return temp_info
    else:
        return None




def get_date(data_date):
    '''取得年月日
    '''
    if data_date:
#        [month,day,year] = data_date.values()
        year = data_date['year']
        month = data_date['month']
        day = data_date['day']
        return datetime.datetime.strptime(str(year)+'-' + str(month)+'-' +str(day),'%Y-%m-%d')
    else:
        return None

def get_money(data_money):
    '''取得金錢
    '''
    if data_money not in ['',None]:
        return int(data_money.replace(',',''))
    else:
        return None



def get_company_infos(row):
    '''取得公司法人資料
    args:
        row -- json 
    return:
        list of dict..公司法人資料
    '''
    try:
        company_list = []
        company_data_dict = {}
        company_data_dict['ID'] = row.get('id')
        if type(row.get(u'公司名稱')) == list:
            company_data_dict[u'公司名稱'] = '/'.join(row.get(u'公司名稱'))
        else:
            company_data_dict[u'公司名稱'] = row.get(u'公司名稱')
        company_data_dict[u'公司狀況'] = row.get(u'公司狀況')
        company_data_dict[u'公司狀況日期'] = get_date(row.get(u'公司狀況日期'))
        
        company_data_dict[u'資本總額(元)'] = get_money(row.get(u'資本總額(元)'))
        company_data_dict[u'實收資本額(元)'] = get_money(row.get(u'實收資本額(元)'))
        
        company_data_dict[u'代表人姓名'] = row.get(u'代表人姓名')
        company_data_dict[u'公司所在地'] = row.get(u'公司所在地')
        company_data_dict[u'總(本)公司統一編號'] = row.get(u'總(本)公司統一編號')
        
        company_data_dict[u'登記機關'] = row.get(u'登記機關')
        company_data_dict[u'核准設立日期'] = get_date(row.get(u'核准設立日期'))
        company_data_dict[u'最後核准變更日期'] = get_date(row.get(u'最後核准變更日期'))
        company_data_dict[u'所營事業資料'] = get_company_info_str(row.get(u'所營事業資料'))
        
        company_data_dict[u'停業日期(起)'] = get_date(row.get(u'停業日期(起)'))
        company_data_dict[u'停業日期(迄)'] = get_date(row.get(u'停業日期(迄)'))
        company_data_dict[u'舊營業項目資料'] = row.get(u'舊營業項目資料')
        
        company_data_dict[u'來源'] = row.get(u'來源')
        company_data_dict[u'停業核准(備)機關'] = row.get(u'停業核准(備)機關')
        
        
        company_list.append(company_data_dict)
        
        return company_list
    except Exception:
        print('uncatch exception....COMPANY INFO EXCEPTION????')
    


def get_bussiness_infos(row):
    '''取得商業登記資料 
    args : 
        row -- json
    return :
        list of dict -- 
    '''
    business_list = []
    business_dict = {}
    business_dict['ID'] = row.get('id')
    business_dict['登記機關'] = row.get('登記機關')
    business_dict['核准設立日期'] = get_date(row.get('核准設立日期'))
    business_dict['最近異動日期'] = get_date(row.get('最近異動日期'))
    business_dict['商業名稱'] = row.get('商業名稱')
    business_dict['負責人姓名'] = row.get('負責人姓名')
    business_dict['現況'] = row.get('現況')
    business_dict['資本額(元)'] = get_money(row.get('資本額(元)'))
    business_dict['組織類型'] = row.get('組織類型')
    business_dict['地址'] = row.get('地址')
    business_dict['營業項目'] = row.get('營業項目')
    
    business_list.append(business_dict)
    
    return business_list


def get_branch_infos(row):
    '''取得分公司資料
    args:
        row json 只有分公司的
    return:
        list of dict ...分公司資料
    '''
    branch_list = []
    branch_data_dict = {}

    branch_data_dict[u'ID'] = row.get('id')
    branch_data_dict[u'分公司名稱'] = row.get(u'分公司名稱')
    branch_data_dict[u'分公司狀況'] = row.get(u'分公司狀況')
    branch_data_dict[u'分公司所在地'] = row.get(u'分公司所在地')
    
    branch_data_dict[u'核准設立日期'] = get_date(row.get(u'核准設立日期'))
    branch_data_dict[u'最後核准變更日期'] = get_date(row.get(u'最後核准變更日期'))
    
    branch_data_dict[u'總(本)公司統一編號'] = row.get(u'總(本)公司統一編號')
    branch_data_dict[u'廢止日期'] = get_date(row.get(u'廢止日期'))
    
    branch_list.append(branch_data_dict)
    
    return branch_list
    



def get_director_lists(row):
    director_lists = []
    
    id = row['id']
    if row.get(u'董監事名單'):
        for e in row.get(u'董監事名單'):
            director = {}
            director['id'] = id
            director[u'姓名'] = e.get(u'姓名')
            director[u'職稱'] = e.get(u'職稱')
            if e.get(u'出資額'):
                director[u'出資額'] = int(e.get(u'出資額').replace(',',''))
            else:
                director[u'出資額'] = None
            if e.get(u'所代表法人'):
                director[u'所代表法人'] = e.get(u'所代表法人')[1]
            else:
                director[u'所代表法人'] = None
            director_lists.append(director)
        return director_lists
    else:
        return []


def get_branch_manager(row):
    '''分公司經理人姓名
    '''
    return [{'id':row.get('id'),u'姓名':row.get('分公司經理姓名')}]


def get_manager_lists(row):
    '''公司經理人資料
    '''
    manager_lists = []
    manager = {}
    id = row['id']
    if row.get(u'經理人名單'):
        for e in row.get(u'經理人名單'):
            manager['id'] = id
            manager[u'姓名'] = e.get(u'姓名')
            manager[u'到職日期'] = get_date(e.get(u'到職日期'))
            manager_lists.append(manager)    
        return manager_lists
    
    else:
        return []


def to_db(datasets,table,conn):
    '''寫入sql-server 
    args:
        datasets: list of dict
        table: 資料庫表格名稱
        cursor: 連接資料庫的指標
    '''
    cursor = conn.cursor()
    try:
        for index, row in enumerate(datasets):
            # row data        
            fields = ','.join([ '['+e+ ']' for e in row.keys()]) # 欄位        
            values = row.values() # 值
            num_quest = '?' + ',?' * (len(row.keys())-1)
            try:
                sql_insert = u"""INSERT INTO {0}({1}) VALUES({2})""".format(
                    table, fields, num_quest)
                
                cursor.execute(sql_insert, list(values))
                # print "row index : %d, success!" %index
            except pypyodbc.IntegrityError as e:
                pass # 資料重複就跳過
    #            print('Data key Duplicate!! Forbiden')
            
            except pypyodbc.DataError as e:
                print('Data Error, can\'t handle!')
            except pypyodbc.ProgrammingError as e:
                print('Programming error')
            except TypeError:
                print('Type error!!')
        cursor.commit()
    except Exception:
        pass
    finally:
        cursor.close()

#%%
def json_parser_business_tosql(filepath,conn):
    
    with gzip.open(filepath) as f:
        index = 0         
        for line in f:
            index+=1 
            try:
                if line:
                    
                    line = line.decode('utf8') # 轉為str非byte
                    ## 處理每一列中非json格式
                    if line[0] != '{':
                        json_index_from = line.find(',') + 1
                        line = line[json_index_from:]
                        json_data = json.loads(line)
                    else:
                        json_data = json.loads(line)
                    to_db(get_bussiness_infos(json_data),'商業登記資料',conn)
                        

#                print('row:{} success!'.format(index))
            except ValueError:
                print('Value Error when loading .gz file, occur index: {}'.format(index))
                
            if index%100 == 0: 
                print('Finished {} rows'.format(index))
        
    
def json_parser_company_tosql(filepath,conn):

    
    with gzip.open(filepath) as f:
        index = 0         
        for line in f:
            index+=1 
            try:
                if line:
                    
                    line = line.decode('utf8') # 轉為str非byte
                    ## 處理每一列中非json格式
                    if line[0] != '{':
                        json_index_from = line.find(',') + 1
                        line = line[json_index_from:]
                        json_data = json.loads(line)
                    else:
                        json_data = json.loads(line)
                        
                    ## 判斷為公司或分公司資料
                    if json_data.get(u'分公司名稱'):
                        # 分公司 
                        branch_list = get_branch_infos(json_data)
                        to_db(branch_list,u'分公司資料',conn)
                        # 分公司經理
                        to_db(get_branch_manager(json_data),u'公司經理人',conn)
                    else:
                        # 公司法人
                        company_list = get_company_infos(json_data)
                        to_db(company_list,u'公司法人資料',conn)
                    
                        ## 公司董監事
                        
                        to_db(get_director_lists(json_data),u'公司董監事',conn)
                        ## 公司經理人
                        manager_list = get_manager_lists(json_data)
                        to_db(manager_list,u'公司經理人',conn)


#                print('row:{} success!'.format(index))
            except ValueError:
                print('Value Error when loading .gz file, occur index: {}'.format(index))
                
            if index%100 == 0: 
                print('Finished {} rows'.format(index))
#%%
if __name__ == '__main__': 
    
    import requests
    #import sys
    # sys.getdefaultencoding() # utf8 in py3k
    import pypyodbc
    import datetime
    import gzip
    import json

#==============================================================================
# 下載資料
#==============================================================================
#    
#    # http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/00000000.json.gz
#    file_indexes = ['00000000','10000000','20000000','30000000','40000000','50000000','60000000','70000000','80000000','90000000']
#    # file_name = file_indexes[0] + '.json.gz'
#    path = '../data/'
#    url + file_indexes[0] + '.jsonl.gz'
#    download_gz(path,file_indexes)
  
#==============================================================================
# 整理公司資料json檔案與儲存至資料庫(sql-server)
#==============================================================================
    filename_list = ['00000000','10000000','20000000','30000000','40000000','50000000','60000000','70000000','80000000','90000000']
    filepath = ['../data/'+ e + '.jsonl.gz' for e in filename_list]
    conn = pypyodbc.connect("DRIVER={SQL Server};SERVER=name;UID=uid;PWD=012345;DATABASE=db;")

    for name in filepath[3:]:
        json_parser_company_tosql(name,conn)


#==============================================================================
# 整理商業登記資料json檔案並存到資料庫(sql-server)
#==============================================================================
#%%
#table = '公司法人資料'
#data = []
#with gzip.open(filepath[1]) as f:
#    for line in f:
#        line = line.decode('utf8')
#        data.append(line)
#%%



#%% 
#==============================================================================
# 測試區
#==============================================================================
#table = '公司董監事'
#table = '公司經理人'
#table = '公司法人資料'
#datasets = get_company_infos(json.loads(data[2300]))
#cursor = conn.cursor()
#def test_todb(datasets,table='公司法人資料'):
#    
#    for index, row in enumerate(datasets):
#        # row data        
#        fields = ','.join([ '['+e+ ']' for e in row.keys()]) # 欄位        
#        values = row.values() # 值
#        num_quest = '?' + ',?' * (len(row.keys())-1)
#       
#        sql_insert = u"""INSERT INTO {0}({1}) VALUES({2})""".format(table, fields, num_quest)
#        try:        
#            cursor.execute(sql_insert, list(values))
#    #    print("row index : %d, success!"%index)
#        except pypyodbc.IntegrityError:
#            pass
#
#for index in range(1900,2000):
#    try:
#        datasets = get_company_infos(json.loads(data[index]))
#        test_todb(datasets)
##        datasets = get_manager_lists(json.loads(data[index]))
##        test_todb(datasets,'公司經理人')
##        datasets = get_director_lists(json.loads(data[index]))
##        test_todb(datasets,'公司董監事')
#    except json.JSONDecodeError:
#        print('decode error')
#    print('index:{} finished!'.format(index))
#cursor.commit()