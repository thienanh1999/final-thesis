def validate_uploaded_document(docs):
    for doc in docs:
        fields = check_fields(doc, ['time', 'title', 'order'])
        if len(fields) != 0:
            return 'Required fields ' + ' , '.join(fields)
        for item in doc['order']:
            if doc.get(item, None) is None:
                return 'Doc lacking ' + item + ' field'
    return None


def check_fields(obj, fields):
    lacking_fields = []
    for field in fields:
        if obj.get(field, None) is None:
            lacking_fields.append(field)
    return lacking_fields


def add_id_to_docs(start_id, docs):
    for doc in docs:
        doc['_id'] = start_id
        start_id += 1
    return docs
